# Minnah's Spotify Wrapped Website

## Description
Personal website made to mimic Spotify Wrapped listening information.

## Features:
-Shows your top genre
-A silly main character analysis based on the overall genres you listen to
-Top songs (from the last 6 months)
-Top artists (from last 6 months)

## How this works:
1. Log in with spotify. Uses authentication and hashing in order for security, and gains your access token
2. Uses spotify's api to gain information of users top songs and artists
3. Uses last fms api to gain information of the artists top genres
4. Uses a collection to obtain information of most frequently listened to genres (to find top genre)
5. Uses that same data to as a prompt input into gemini's api, to output the main character analysis
