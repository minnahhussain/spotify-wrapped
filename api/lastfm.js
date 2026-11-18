// Vercel serverless function: looks up an artist's top tags using the Last.fm key stored on the server.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { artist } = req.query;

  if (typeof artist !== "string" || artist.length === 0 || artist.length > 100) {
    return res.status(400).json({ error: "Invalid artist" });
  }

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${encodeURIComponent(
        artist
      )}&api_key=${process.env.LASTFM_API_KEY}&format=json`
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Last.fm request failed:", err);
    return res.status(500).json({ error: "Last.fm request failed" });
  }
}