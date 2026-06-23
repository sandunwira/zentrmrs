const JELLY_URL = process.env.JELLY_URL || 'http://localhost:8096';
const JELLY_TOKEN = process.env.JELLY_TOKEN || '';
const JELLY_USER_ID = process.env.JELLY_USER_ID || '';

function headers() {
	return {
		Accept: 'application/json',
		'Content-Type': 'application/json',
		'X-Emby-Authorization': `MediaBrowser Client="Zentrmrs", Device="PC", DeviceId="zentrmrs-device", Version="1.0.0", Token="${JELLY_TOKEN}"`
	};
}

async function jellyFetch(path) {
	const res = await fetch(`${JELLY_URL}${path}`, { headers: headers() });
	if (!res.ok) throw new Error(`Jellyfin error ${res.status} on ${path}`);
	return res.json();
}

export async function jellyGetViews(userId = JELLY_USER_ID) {
	if (!userId) throw new Error('JELLY_USER_ID is required');
	return jellyFetch(`/Users/${userId}/Views`);
}

export async function jellyGetItems({
	userId = JELLY_USER_ID,
	parentId,
	includeItemTypes = 'Audio',
	recursive = true,
	limit = 200,
	startIndex = 0,
	sortBy = 'SortName'
}) {
	if (!userId) throw new Error('JELLY_USER_ID is required');
	const qs = new URLSearchParams({
		ParentId: parentId,
		IncludeItemTypes: includeItemTypes,
		Recursive: String(recursive),
		Limit: String(limit),
		StartIndex: String(startIndex),
		SortBy: sortBy,
		Fields:
			'Overview,Genres,MediaSources,ProviderIds,Tags,Studios,Path,DateCreated,PremiereDate,UserData,RecursiveItemCount,ChildCount,Album,AlbumArtist,Artists'
	});
	return jellyFetch(`/Users/${userId}/Items?${qs.toString()}`);
}

export async function jellyGetItem(itemId, userId = JELLY_USER_ID) {
	if (!userId) throw new Error('JELLY_USER_ID is required');
	return jellyFetch(`/Users/${userId}/Items/${itemId}`);
}