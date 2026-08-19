// This file handles Spotify login using the PKCE flow.
// You don't need to memorize this — just understand the big picture:
// 1. redirectToSpotifyLogin() sends the user to Spotify to log in
// 2. getAccessToken() runs when Spotify sends them back, and trades
//    the temporary code for a real access token we can use to fetch data

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = window.location.origin + "/callback";
const SCOPES = [
  "user-top-read",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

// --- Helper functions PKCE requires (generates a random "secret" and hashes it) ---

function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// --- Step 1: Send the user to Spotify's login page ---

export async function redirectToSpotifyLogin() {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  // We save this in the browser so we can use it again once Spotify redirects back
  window.localStorage.setItem("code_verifier", codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// --- Step 2: Trade the temporary code Spotify gave us for a real access token ---

export async function getAccessToken(code) {
  const codeVerifier = window.localStorage.getItem("code_verifier");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await response.json();
  return data.access_token;
}