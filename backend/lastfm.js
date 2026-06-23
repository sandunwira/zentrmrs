const LASTFM_KEY = process.env.LASTFM_KEY || '';
const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/';

async function fetchJson(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Last.fm error ${res.status}`);
	return res.json();
}

export async function similarTracksForSeed({ artist, track, limit = 5 }) {
	if (!LASTFM_KEY) return [];
	if (!artist || !track) return [];
	const qs = new URLSearchParams({
		method: 'track.getSimilar',
		artist,
		track,
		api_key: LASTFM_KEY,
		format: 'json',
		limit: String(limit)
	});
	const json = await fetchJson(`${LASTFM_BASE}?${qs.toString()}`);
	const rows = json?.similartracks?.track || [];
	return rows.map((x) => ({
		name: x.name,
		artist: x.artist?.name || x.artist?.['#text'] || '',
		match: Number(x.match || 0)
	}));
}

export function uniqueRecommendations(rows, jellyTracks = []) {
	const existing = new Set(
		jellyTracks.map(
			(t) =>
				`${String(t.Name || '').toLowerCase()}|${String(
					t.Artists?.[0] || t.AlbumArtist || ''
				).toLowerCase()}`
		)
	);

	const seen = new Set();
	const out = [];

	for (const r of rows) {
		const key = `${String(r.name || '').toLowerCase()}|${String(r.artist || '').toLowerCase()}`;
		if (!r.name || !r.artist) continue;
		if (existing.has(key) || seen.has(key)) continue;
		seen.add(key);
		out.push(r);
	}

	return out.sort((a, b) => (b.match || 0) - (a.match || 0));
}