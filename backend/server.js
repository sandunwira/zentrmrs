import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jellyGetViews, jellyGetItems, jellyGetItem } from './jellyfin.js';
import { similarTracksForSeed, uniqueRecommendations } from './lastfm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Constants ---
const PORT = process.env.PORT || 4000;
const TEMP_DIR = path.join(__dirname, 'temp_downloads');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
	fs.mkdirSync(TEMP_DIR, { recursive: true });
	console.log(`[Cleanup] Created temp directory: ${TEMP_DIR}`);
}

// --- Cleanup function: delete files older than 2 hours ---
function cleanupTempFiles() {
	try {
		const files = fs.readdirSync(TEMP_DIR);
		const now = Date.now();
		const maxAge = 2 * 60 * 60 * 1000; // 2 hours
		let deletedCount = 0;

		for (const file of files) {
			const filePath = path.join(TEMP_DIR, file);
			try {
				const stats = fs.statSync(filePath);
				if (now - stats.mtimeMs > maxAge) {
					fs.unlinkSync(filePath);
					deletedCount++;
					console.log(`[Cleanup] Deleted old temp file: ${file}`);
				}
			} catch (e) {
				// File might be in use or already deleted – ignore
				console.error(`[Cleanup] Error processing ${file}:`, e.message);
			}
		}

		if (deletedCount > 0) {
			console.log(`[Cleanup] Removed ${deletedCount} old temp file(s) from ${TEMP_DIR}`);
		}
	} catch (e) {
		console.error('[Cleanup] Error during temp cleanup:', e.message);
	}
}

// Run cleanup once on startup
cleanupTempFiles();

// Run cleanup every hour (3600000 ms)
setInterval(cleanupTempFiles, 3600000);

// --- Express app ---
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- Helper: get total audio item count for a library ---
async function getViewItemCount(viewId, userId) {
	try {
		const result = await jellyGetItems({
			userId,
			parentId: viewId,
			includeItemTypes: 'Audio',
			recursive: true,
			limit: 0, // we only need the count
		});
		return result.TotalRecordCount || 0;
	} catch (e) {
		console.error(`Failed to get count for view ${viewId}:`, e);
		return 0;
	}
}

// --- YouTube resolver ---
async function resolveYoutubeVideoId(query) {
	return new Promise((resolve) => {
		const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
		const py = spawn(pythonCmd, ['ytmusic.py', query], { cwd: __dirname });

		let out = '';
		let err = '';
		py.stdout.on('data', (d) => out += d.toString());
		py.stderr.on('data', (d) => err += d.toString());

		py.on('close', (code) => {
			if (code !== 0) {
				console.error(`ytmusic.py exited with code ${code}:`, err);
				resolve('');
			} else {
				resolve(out.trim());
			}
		});

		py.on('error', (e) => {
			console.error('Failed to spawn python:', e);
			resolve('');
		});
	});
}

// --- Routes ---
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/views', async (req, res) => {
	try {
		const views = await jellyGetViews(req.query.userId);
		const musicViews = (views.Items || views || []).filter(v =>
			v.CollectionType === 'music' || /music/i.test(v.Name || '')
		);

		// Add actual item count for each view
		const viewsWithCounts = await Promise.all(
			musicViews.map(async (view) => {
				const count = await getViewItemCount(view.Id, req.query.userId);
				return { ...view, ItemCount: count };
			})
		);

		res.json({ Items: viewsWithCounts });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/api/library/:viewId/items', async (req, res) => {
	try {
		const items = await jellyGetItems({
			userId: req.query.userId,
			parentId: req.params.viewId,
			includeItemTypes: 'Audio,MusicAlbum',
			recursive: true,
			limit: Number(req.query.limit || 9999),
			startIndex: Number(req.query.startIndex || 0),
			sortBy: req.query.sortBy || 'SortName'
		});
		res.json(items);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/api/item/:id', async (req, res) => {
	try {
		const item = await jellyGetItem(req.params.id, req.query.userId);
		res.json(item);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/api/discover', async (req, res) => {
	try {
		const libraryName = String(req.query.library || req.query.libraryName || '').trim();
		const userId = req.query.userId;
		if (!libraryName) return res.status(400).json({ error: 'library is required' });

		const views = await jellyGetViews(userId);
		const viewList = views.Items || views || [];
		const view = viewList.find(
			(v) => String(v.Name || '').toLowerCase() === libraryName.toLowerCase()
		);
		if (!view) return res.status(404).json({ error: 'library not found' });

		const items = await jellyGetItems({
			userId,
			parentId: view.Id,
			includeItemTypes: 'Audio',
			recursive: true,
			limit: 500,
			sortBy: 'DateCreated'
		});

		const tracks = (items.Items || []).filter((x) => x.Type === 'Audio' || x.MediaType === 'Audio');
		if (tracks.length === 0) {
			return res.json({ library: view.Name, count: 0, items: [] });
		}

		const seedCount = Number(req.query.seeds) || 20;
		const shuffled = [...tracks];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		const seeds = shuffled.slice(0, Math.min(seedCount, shuffled.length));

		const gathered = [];
		for (const seed of seeds) {
			const artist = seed.Artists?.[0] || seed.AlbumArtist || seed.Artist || '';
			const track = seed.Name || '';
			const recs = await similarTracksForSeed({ artist, track, limit: 5 });
			gathered.push(...recs.map((r) => ({ ...r, seedTrack: track, seedArtist: artist })));
		}

		const deduped = uniqueRecommendations(gathered, tracks);

		const previewLimit = Number(req.query.previewLimit || 20);
		const previewed = [];
		for (const rec of deduped.slice(0, previewLimit)) {
			const yt = await resolveYoutubeVideoId(`${rec.artist} ${rec.name}`);
			previewed.push({ ...rec, youtubeVideoId: yt });
		}

		res.json({ library: view.Name, count: previewed.length, items: previewed });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.get('/api/download', async (req, res) => {
	try {
		const url = String(req.query.url || '').trim();
		if (!url) return res.status(400).json({ error: 'url is required' });

		// Temp directory is already created globally
		const titleArgs = ['--print', '%(title)s', url];
		const titleProc = spawn('yt-dlp', titleArgs);
		let title = '';
		titleProc.stdout.on('data', (d) => title += d.toString());
		await new Promise((resolve) => titleProc.on('close', resolve));
		title = title.trim() || 'audio';

		const tempFile = path.join(TEMP_DIR, `${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);

		const args = [
			'-f', 'bestaudio',
			'--extract-audio',
			'--audio-format', 'mp3',
			'--audio-quality', '0',
			'--postprocessor-args', '-b:a 320k',
			'--add-metadata',
			'--embed-thumbnail',
			'-o', tempFile,
			url
		];

		const child = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] });
		let stderr = '';

		child.stderr.on('data', (d) => stderr += d.toString());

		const exitCode = await new Promise((resolve) => {
			child.on('close', resolve);
			child.on('error', () => resolve(-1));
		});

		if (exitCode !== 0) {
			if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
			console.error('yt-dlp error:', stderr);
			return res.status(500).json({ error: 'yt-dlp failed', details: stderr });
		}

		if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
			if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
			return res.status(500).json({ error: 'Output file is empty or missing' });
		}

		const stat = fs.statSync(tempFile);
		res.setHeader('Content-Type', 'audio/mpeg');
		res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
		res.setHeader('Content-Length', stat.size);

		const readStream = fs.createReadStream(tempFile);
		readStream.pipe(res);

		readStream.on('end', () => {
			fs.unlink(tempFile, (err) => {
				if (err) console.error('Failed to delete temp file:', err);
			});
		});

		readStream.on('error', (err) => {
			console.error('Stream error:', err);
			fs.unlink(tempFile, () => { });
			if (!res.headersSent) {
				res.status(500).json({ error: 'Stream error' });
			}
		});

	} catch (error) {
		console.error(error);
		if (!res.headersSent) {
			res.status(500).json({ error: error.message });
		}
	}
});

app.listen(PORT, () => {
	console.log(`Backend running on http://localhost:${PORT}`);
});