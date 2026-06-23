# Zentrmrs

A local music discovery app using:

- Jellyfin for your existing library
- Last.fm for similar-track recommendations
- YouTube Music search for previews
- yt-dlp for downloads

## Run backend

```bash
cd backend
cp .env.example .env
npm install
pip install ytmusicapi
npm start
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```
