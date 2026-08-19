# Minnah's Spotify Wrapped

A personal, AI-powered spin on Spotify Wrapped — built in a day to explore what my own listening data says about me.

## Features

- 🎧 Shows your top genre, based on your most-listened-to artists
- ✨ A silly "main character" personality analysis generated from your overall genre mix
- 🎵 Top songs (last 6 months)
- 🎤 Top artists (last 6 months)

## How it works

1. **Login** — Authenticates with Spotify using OAuth (PKCE flow), which hashes a security token to safely confirm the request and retrieve an access token.
2. **Fetch data** — Uses the Spotify Web API to pull the user's top tracks and top artists.
3. **Genre lookup** — Uses the Last.fm API to look up genre tags for each top artist.
4. **Top genre calculation** — Tallies how often each genre appears across the user's top artists to determine their single top genre.
5. **AI personality** — Feeds that same genre breakdown into Google's Gemini API as a prompt, generating a short, personalized "main character" description of the user's music taste.

## Tech stack

- React + Vite
- Spotify Web API
- Last.fm API
- Google Gemini API

## Setup

This project requires your own API keys to run locally.

1. Clone the repo and run `npm install`
2. Create a `.env` file in the root with:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_LASTFM_API_KEY=your_lastfm_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
3. Run `npm run dev`

**Note:** Spotify apps in Development Mode only allow up to 5 authenticated users. You'll need to add any test accounts to your app's allowlist in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
