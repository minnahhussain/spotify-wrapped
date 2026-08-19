Minnah's Spotify Wrapped Website
Features:
>Shows your top genre
>A silly main character analysis based on the overall genres you listen to
>Top songs (from the last 6 months)
>Top artists (from last 6 months)

How this works:
Log in with spotify. Uses authentication and hashing in order for security, and gains your access token
Uses spotify's api to gain information of users top songs and artists
Uses last fms api to gain information of the artists top genres
Uses a collection to obtain information of most frequently listened to genres (to find top genre)
Uses that same data to as a prompt input into gemini's api, to output the main character analysis