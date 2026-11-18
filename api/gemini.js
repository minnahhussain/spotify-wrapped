// Vercel serverless function: runs on the server, so the key never reaches the browser.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { genreSummary } = req.body || {};

  // Basic validation so people can't use this endpoint as a free general-purpose Gemini proxy
  if (
    typeof genreSummary !== "string" ||
    genreSummary.length === 0 ||
    genreSummary.length > 500
  ) {
    return res.status(400).json({ error: "Invalid genreSummary" });
  }

  // The prompt lives here on the server, not in the browser
  const prompt = `Someone's music taste breaks down into these genres, with how many of their top artists fall into each: ${genreSummary}. 
Write a short, fun music-personality, but human-like and meaningful description for them, use no hyphens (-), explain it like they are the main character of some kind of story — blend the genres together into one cohesive vibe rather than listing them separately. 
Give it a punchy 2-4 word title (like "Dreamy Groove Chaser"), then a 1-2 sentence description. 
Respond ONLY in this exact JSON format, nothing else: {"title": "...", "description": "..."}`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY, // no VITE_ prefix = never sent to the browser
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Gemini request failed:", err);
    return res.status(500).json({ error: "Gemini request failed" });
  }
}