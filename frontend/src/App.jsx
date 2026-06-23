import { useRef } from 'react';
import { BrowserRouter, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { useEffect, useState, createContext, useContext } from 'react';

const API = '';

// --- Tabler Icons (inline SVG components) ---
const IconPlay = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-player-play">
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
	</svg>
);

const IconPause = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-player-pause">
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
		<path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
	</svg>
);

const IconDownload = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-download">
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M20 16a1 1 0 0 1 1 1v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-2a1 1 0 0 1 2 0v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1 -1v-2a1 1 0 0 1 1 -1m-8 -13a1 1 0 0 1 1 1v9.585l3.293 -3.292a1 1 0 0 1 1.414 1.414l-5 5a1 1 0 0 1 -.09 .08l.09 -.08a1 1 0 0 1 -.674 .292l-.033 .001h-.032l-.054 -.004l.086 .004a1 1 0 0 1 -.617 -.213a1 1 0 0 1 -.09 -.08l-5 -5a1 1 0 0 1 1.414 -1.414l3.293 3.292v-9.585a1 1 0 0 1 1 -1" />
	</svg>
);

const IconLibrary = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-layout-dashboard">
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M9 3a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2zm0 12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-2a2 2 0 0 1 2 -2zm10 -4a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2zm0 -8a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-2a2 2 0 0 1 2 -2z" />
	</svg>
);

const IconDiscover = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-compass">
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 14.66a1 1 0 1 0 0 2a1 1 0 0 0 0 -2m3.684 -10.949l-6 2a1 1 0 0 0 -.633 .633l-2.007 6.026l-.023 .086l-.017 .113l-.004 .068v.044l.009 .111l.012 .07l.04 .144l.045 .1l.054 .095l.064 .09l.069 .075l.084 .074l.098 .07l.1 .054l.078 .033l.105 .033l.109 .02l.043 .005l.068 .004h.044l.111 -.009l.07 -.012l.02 -.006l.019 -.002l.074 -.022l6 -2a1 1 0 0 0 .633 -.633l2 -6a1 1 0 0 0 -1.265 -1.265zm-1.265 2.529l-1.21 3.629l-3.629 1.21l1.21 -3.629l3.629 -1.21zm-9.419 1.42a1 1 0 1 0 0 2a1 1 0 0 0 0 -2m14 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2m-7 -7a1 1 0 1 0 0 2a1 1 0 0 0 0 -2" />
	</svg>
);

const IconLoading = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-loader-4 animate-spin">
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<path d="M12 21v-3m6.36 .36l-2.12 -2.12m4.76 -4.24h-3m.36 -6.36l-2.12 2.12m-4.24 -4.76v3m-6.36 -.36l2.12 2.12m-3.76 4.24h2m1 4.95l.71 -.71" />
	</svg>
);

// --- Shared context for libraries ---
const LibraryContext = createContext();

function useLibrary() {
	return useContext(LibraryContext);
}

// --- Helper to fetch JSON ---
async function getJson(url, options) {
	const res = await fetch(url, options);
	if (!res.ok) throw new Error(await res.text());
	return res.json();
}

// --- Layout component (shared header & nav) ---
function AppLayout() {
	const linkBase = 'rounded-xs px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center';
	const [views, setViews] = useState([]);
	const [selectedViewId, setSelectedViewId] = useState('');
	const [loadingViews, setLoadingViews] = useState(true);

	useEffect(() => {
		getJson(`${API}/api/views`)
			.then((data) => {
				setViews(data.Items || []);
				if (data.Items?.length) setSelectedViewId(data.Items[0].Id);
			})
			.catch(console.error)
			.finally(() => setLoadingViews(false));
	}, []);

	const selectedLibrary = views.find(v => v.Id === selectedViewId);

	return (
		<LibraryContext.Provider value={{ views, selectedViewId, setSelectedViewId, selectedLibrary, loadingViews }}>
			<div className="fixed top-0 left-0 min-h-screen max-h-screen min-w-screen max-w-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
				<div className="mx-auto max-w-7xl px-4 py-6">
					<header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
								ZentrMRS
							</h1>
							<p className="text-sm text-slate-400">Discover music from your Jellyfin library</p>
						</div>
						<nav className="inline-flex rounded-xs bg-slate-800/50 p-1 backdrop-blur-sm ring-1 ring-white/10 gap-1.5">
							<NavLink
								to="/"
								end
								className={({ isActive }) =>
									`${linkBase} ${isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-300 hover:bg-white/5'}`
								}
							>
								<IconLibrary className="w-4 h-4" />
								In Library
							</NavLink>
							<NavLink
								to="/discover"
								className={({ isActive }) =>
									`${linkBase} ${isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-300 hover:bg-white/5'}`
								}
							>
								<IconDiscover className="w-4 h-4" />
								Discover
							</NavLink>
						</nav>
					</header>
					<Outlet />
				</div>
			</div>
		</LibraryContext.Provider>
	);
}

// --- Library Page ---
function LibraryPage() {
	const { views, selectedViewId, setSelectedViewId, selectedLibrary, loadingViews } = useLibrary();
	const [items, setItems] = useState([]);
	const [loadingItems, setLoadingItems] = useState(false);

	useEffect(() => {
		if (!selectedViewId) return;
		setLoadingItems(true);
		getJson(`${API}/api/library/${selectedViewId}/items`)
			.then((data) => setItems(data.Items || []))
			.catch(console.error)
			.finally(() => setLoadingItems(false));
	}, [selectedViewId]);

	const libraryCards = items.map((item) => ({
		id: item.Id,
		title: item.Name,
		artist: item.Artists?.[0] || item.AlbumArtist || '',
		album: item.Album || '',
		duration: item.RunTimeTicks ? Math.round(item.RunTimeTicks / 10000000) : '',
	}));

	return (
		<section className="space-y-6">
			<div className="flex flex-wrap items-center gap-3 rounded-xs bg-slate-800/50 p-4 backdrop-blur-sm ring-1 ring-white/10">
				<label className="text-sm font-medium text-slate-300 flex items-center gap-2">
					<IconLibrary className="w-4 h-4" />
					Music library
				</label>
				{loadingViews ? (
					<span className="text-sm text-slate-400">Loading libraries</span>
				) : (
					<select
						className="rounded-xs bg-slate-900 px-4 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500 transition"
						value={selectedViewId}
						onChange={(e) => setSelectedViewId(e.target.value)}
					>
						{views.map((v) => (
							<option key={v.Id} value={v.Id}>
								{v.Name} ({v.ItemCount || v.ChildCount || 0} tracks)
							</option>
						))}
					</select>
				)}
				{selectedLibrary && (
					<span className="text-xs text-slate-400 ml-auto">
						{selectedLibrary.ItemCount || selectedLibrary.ChildCount || 0} tracks in this library
					</span>
				)}
			</div>

			{loadingItems && (
				<div className="flex items-center justify-center py-8">
					<IconLoading className="w-6 h-6 text-indigo-400" />
					<span className="ml-2 text-slate-400">Loading tracks</span>
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-y-auto max-h-[calc(100vh-340px)]">
				{libraryCards.map((t) => (
					<article
						key={t.id}
						className="group rounded-xs bg-slate-800/30 p-4 backdrop-blur-sm ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:ring-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/10"
					>
						<h3 className="line-clamp-2 text-base font-semibold text-white group-hover:text-indigo-300 transition">
							{t.title}
						</h3>
						<p className="mt-2 text-sm text-slate-400">{t.artist}</p>
						<p className="mt-1 text-sm text-slate-500">{t.album}</p>
						<p className="mt-3 text-xs text-slate-500">{t.duration ? `${t.duration}s` : ''}</p>
					</article>
				))}
			</div>
			{!loadingItems && libraryCards.length === 0 && (
				<p className="text-center text-slate-400 py-8">No tracks found in this library.</p>
			)}
		</section>
	);
}

// --- Discover Page (audio-only preview, stops after 30s) ---
function DiscoverPage() {
	const { views, selectedViewId, setSelectedViewId, selectedLibrary } = useLibrary();
	const [discoverItems, setDiscoverItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [playingId, setPlayingId] = useState(null);
	const [downloadingId, setDownloadingId] = useState(null); // track which video is downloading
	const [error, setError] = useState('');
	const timeoutRef = useRef(null);

	const discover = async () => {
		if (!selectedViewId) {
			setError('Please select a library first.');
			return;
		}
		setLoading(true);
		setError('');
		if (playingId) {
			clearTimeout(timeoutRef.current);
			setPlayingId(null);
		}
		try {
			const data = await getJson(
				`${API}/api/discover?library=${encodeURIComponent(selectedLibrary.Name)}&previewLimit=20`
			);
			setDiscoverItems(data.items || []);
			if (data.items?.length === 0) setError('No recommendations found for this library.');
		} catch (err) {
			setError(err.message || 'Failed to fetch recommendations.');
		} finally {
			setLoading(false);
		}
	};

	const togglePlay = (videoId) => {
		if (!videoId) return;
		if (playingId === videoId) {
			clearTimeout(timeoutRef.current);
			setPlayingId(null);
			return;
		}
		if (playingId) {
			clearTimeout(timeoutRef.current);
			setPlayingId(null);
		}
		setPlayingId(videoId);
		timeoutRef.current = setTimeout(() => {
			setPlayingId(null);
		}, 30000);
	};

	const download = async (ytId) => {
		if (!ytId || downloadingId) return; // prevent multiple downloads

		setDownloadingId(ytId);
		try {
			const url = `${API}/api/download?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${ytId}`)}`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Download failed with status ${response.status}`);
			}

			// Get filename from Content-Disposition header or fallback
			const contentDisposition = response.headers.get('content-disposition');
			let filename = `${ytId}.mp3`;
			if (contentDisposition) {
				const match = contentDisposition.match(/filename="(.+)"/);
				if (match) filename = match[1];
			}

			const blob = await response.blob();
			const blobUrl = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(blobUrl);
		} catch (err) {
			console.error('Download error:', err);
			alert('Download failed: ' + err.message);
		} finally {
			setDownloadingId(null);
		}
	};

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	return (
		<section className="space-y-6">
			<div className="flex flex-wrap items-center gap-3 rounded-xs bg-slate-800/50 p-4 backdrop-blur-sm ring-1 ring-white/10">
				<label className="text-sm font-medium text-slate-300 flex items-center gap-2">
					<IconDiscover className="w-4 h-4" />
					Select library
				</label>
				<select
					className="rounded-xs bg-slate-900 px-4 py-2 text-sm text-slate-100 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500 transition"
					value={selectedViewId || ''}
					onChange={(e) => {
						setSelectedViewId(e.target.value);
						if (playingId) {
							clearTimeout(timeoutRef.current);
							setPlayingId(null);
						}
					}}
				>
					<option value="">Select a library</option>
					{views.map((v) => (
						<option key={v.Id} value={v.Id}>
							{v.Name} ({v.ItemCount || v.ChildCount || 0} tracks)
						</option>
					))}
				</select>
				<button
					className="rounded-xs bg-indigo-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 disabled:opacity-50 flex items-center gap-2"
					onClick={discover}
					disabled={!selectedViewId || loading}
				>
					{loading ? (
						<>
							<IconLoading className="w-4 h-4" />
							Generating
						</>
					) : (
						'Discover'
					)}
				</button>
				{error && <span className="text-sm text-red-400">{error}</span>}
			</div>

			{loading && (
				<div className="flex items-center justify-center py-8">
					<IconLoading className="w-6 h-6 text-indigo-400" />
					<span className="ml-2 text-slate-400">Fetching recommendations</span>
				</div>
			)}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-[calc(100vh-340px)]">
				{discoverItems.map((r, idx) => {
					const videoId = r.youtubeVideoId;
					const isPlaying = playingId === videoId;
					const isDownloading = downloadingId === videoId;

					return (
						<article
							key={`${r.artist}-${r.name}-${idx}`}
							className="group rounded-xs bg-slate-800/30 p-4 backdrop-blur-sm ring-1 ring-white/10 transition-all hover:ring-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/5"
						>
							<div className="flex flex-row gap-4 mb-4">
								{/* Album Art container – clickable, with overlay always visible */}
								<div
									className="relative w-20 h-20 shrink-0 cursor-pointer rounded-xs overflow-hidden ring-1 ring-white/10 transition group-hover:ring-indigo-400/50"
									onClick={() => togglePlay(videoId)}
								>
									{videoId ? (
										<img
											src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
											alt={`${r.name} album art`}
											className="w-full h-full object-cover"
											onError={(e) => (e.target.style.display = 'none')}
										/>
									) : (
										<div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs text-slate-500">
											No image
										</div>
									)}

									{/* Play/Pause overlay – visible on all devices */}
									{videoId && (
										<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
											<div className="bg-black/60 rounded-full w-10 h-10 flex items-center justify-center text-white transition group-hover:bg-black/80">
												{isPlaying ? <IconPause className="w-5 h-5" /> : <IconPlay className="w-5 h-5" />}
											</div>
										</div>
									)}
								</div>

								<div className="flex-1 min-w-0">
									<h3 className="line-clamp-2 text-base font-semibold text-white group-hover:text-indigo-300 transition">
										{r.name}
									</h3>
									<p className="mt-1 text-sm text-slate-400">{r.artist}</p>
								</div>
							</div>

							{/* Hidden iframe */}
							{isPlaying && videoId && (
								<iframe
									title="audio preview"
									src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&playsinline=1&modestbranding=1&start=30`}
									className="hidden"
									allow="autoplay; encrypted-media"
								/>
							)}

							{/* Download button with loading state */}
							<button
								className="w-full rounded-xs bg-emerald-500/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
								onClick={() => download(videoId)}
								disabled={!videoId || isDownloading}
							>
								{isDownloading ? (
									<>
										<IconLoading className="w-4 h-4" />
										Downloading...
									</>
								) : (
									<>
										<IconDownload className="w-4 h-4" />
										Download
									</>
								)}
							</button>
						</article>
					);
				})}
			</div>
			{!loading && discoverItems.length === 0 && !error && (
				<p className="text-center text-slate-400 py-8">Click "Discover" to get recommendations.</p>
			)}
		</section>
	);
}

// --- Main App ---
export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<AppLayout />}>
					<Route index element={<LibraryPage />} />
					<Route path="discover" element={<DiscoverPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}