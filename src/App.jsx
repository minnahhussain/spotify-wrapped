import { useEffect, useState, useRef } from "react";
import { redirectToSpotifyLogin, getAccessToken } from "./auth";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [topTracks, setTopTracks] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [artistGenres, setArtistGenres] = useState({})
  const [topGenre, setTopGenre] = useState("");
  const [personality, setPersonality] = useState({ title: "", description: "" });
  const [carouselIndex, setCarouselIndex] = useState(9);
  const hasFetchedGemini = useRef(false);
  useEffect(() => {
    // Check if Spotify just redirected us back with a code in the URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      getAccessToken(code).then((accessToken) => {
        setToken(accessToken);
        // Clean up the URL so the code doesn't stay visible/reusable
        window.history.replaceState({}, document.title, "/");
      });
    }
  }, []);

  useEffect(()=>{
    if(!token) return; //stops from running before logging in
      
    fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", { //sets request to see top ten tracks
      headers: {
        Authorization: `Bearer ${token}`, //attaches access token
      },
    })
    .then((response) => response.json()) //converst to javascript
    .then((data)=> {
      setTopTracks(data.items); //grabs array and saves into topTracks
    });
  }, [token]); //rerun whenever token changes
  //same idea for artist v
  useEffect(() => {
  if (!token) return;

  fetch("https://api.spotify.com/v1/me/top/artists?limit=10", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      setTopArtists(data.items);
    });
}, [token]);

useEffect(() => {
  if (topArtists.length === 0) return; //if we have no artists to look up

  topArtists.forEach((artist) => { // loop through each artist andd seperate request for each
    fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${encodeURIComponent(
        artist.name
      )}&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&format=json` //pulls key
    )
      .then((response) => response.json())
      .then((data) => {
        const tags = data.toptags.tag //ordered most releveant, joins into a string
          .slice(0, 2)
          .map((t) => t.name)
          .join(", ");

        setArtistGenres((prev) => ({ //copies everything and updates
          ...prev,
          [artist.name]: tags || "No genres found",
        }));
      });
  });
}, [topArtists]);

useEffect(() => {
  const allGenres = Object.values(artistGenres) //genre strings
    .join(", ")
    .split(", ") //connects them all and then splits
    .filter((g) => g && g !== "No genres found"); //removes empty strings
  if(topArtists.length ==0) return;
  if (allGenres.length === 0) return; //safety
  if (Object.keys(artistGenres).length < topArtists.length) return; //sanity check for if we got all data yet
  if (hasFetchedGemini.current) return;
  if (personality.title) return;


  const counts = {};
  allGenres.forEach((genre) => {
    counts[genre] = (counts[genre] || 0) + 1; //counts each entry
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  setTopGenre(sorted[0][0]); //sorts and saves winner!!

  const genreSummary = sorted //list of genres saved into genreSummary
    .map(([genre,count]) => `${genre} (${count})`) //loop and turns into readable string
    .join(", ");
    const cached = localStorage.getItem("personality_" + genreSummary);
    if (cached) {
      setPersonality(JSON.parse(cached));
      return;
    }
    hasFetchedGemini.current = true;
  const prompt = `Someone's music taste breaks down into these genres, with how many of their top artists fall into each: ${genreSummary}. 
Write a short, fun music-personality, but human-like and meaningful description for them, use no hyphens (-), explain it like they are the main character of some kind of story — blend the genres together into one cohesive vibe rather than listing them separately. 
Give it a punchy 2-4 word title (like "Dreamy Groove Chaser"), then a 1-2 sentence description. 
Respond ONLY in this exact JSON format, nothing else: {"title": "...", "description": "..."}`;
fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
  {
    method: "POST", //sending data
    headers: { "Content-Type": "application/json" }, //sending json formatted
    body: JSON.stringify({ //converts into text string
      contents: [{ parts: [{ text: prompt }] }], 
    }),
  }
)
  .then((response) => response.json()) //turns into js data
  .then((data) => {
    if (!data.candidates){
      console.log("Gemini error: ", data);
      hasFetchedGemini.current = false;
      return;
    }
    const text = data.candidates[0].content.parts[0].text; 
    const cleaned = text.replace(/```json|```/g, "").trim(); //fixes formatting as needed
    const parsed = JSON.parse(cleaned); //turns into jsn format
    setPersonality(parsed);//saved
    localStorage.setItem("personality_" + genreSummary, JSON.stringify(parsed));
  });
}, [artistGenres, topArtists.length, personality.title]); 
function handleSkip() {
  setCarouselIndex((prev) => (prev === 0 ? topTracks.length - 1 : prev - 1));
}
return (
    <div className="app">
      <h1>My Spotify Wrapped</h1>

      {!token ? (
        <>
          <p className="subtitle">See what your listening says about you</p>
          <button className="login-button" onClick={redirectToSpotifyLogin}>
            Login with Spotify
          </button>
        </>
      ) : (
        <div className="content">
          {topGenre && (
            <p className="top-genre">
              Your top genre: <strong>{topGenre}</strong>
            </p>
          )}

          {personality.title && (
            <div className="card personality-card">
              <h2>{personality.title}</h2>
              <p>{personality.description}</p>
            </div>
          )}
          {topTracks.length > 0 && (
            <div className="card carousel-card">
              <h2>Track #{carouselIndex + 1}</h2>
              <img
                className="carousel-cover"
                src={topTracks[carouselIndex].album.images[0].url}
                alt={topTracks[carouselIndex].name}
                key={topTracks[carouselIndex].id}
              />
              <p className="carousel-track-name">{topTracks[carouselIndex].name}</p>
              <p className="carousel-artist-name">
                {topTracks[carouselIndex].artists[0].name}
              </p>
              <button className="skip-button" onClick={handleSkip}>
                Skip →
              </button>
            </div>
          )}
          <div className="card">
            <h2>Your Top Tracks</h2>
            <ol className="track-list">
              {topTracks.map((track, index) => (
                <li key={track.id}>
                  <span className="counter">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <div className="track-name">{track.name}</div>
                    <div className="track-artist">{track.artists[0].name}</div>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="card">
            <h2>Your Top Artists</h2>
            <ol className="artist-list">
              {topArtists.map((artist, index) => (
                <li key={artist.id}>
                  <span className="counter">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <div className="artist-name">{artist.name}</div>
                    <div className="artist-genres">
                      {artistGenres[artist.name] || "Loading..."}
                    </div>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;