# Spotify Album Shuffle

Spotify Album Shuffle connects with your Spotify account to generate and play a queue of all the albums saved in your library in a random order. If you have hundreds of albums saved, like me, hopefully this can alleviate the burden of having too many choices when you feel like listening to a full album :)

Note: Currently, using the web player requires a Spotify Premium account. You *can* still use this application without a Premium account to generate a random list of albums, but unfortunately you will have to manually play it on another Spotify player. I will be adding an alternative so that free Spotify users can still play their shuffled albums on another device, but for now, it might be a bit rough :(

## Local development/deployment

This application requires:

- Node.js, with `yarn` as a package manager (`npm` will not work!)
- PostgreSQL

### Setup
- `git clone https://github.com/garrettdunc/spotify-album-shuffle`
- `cd spotify-album-shuffle && yarn install`

And set up a `.env` file in the `server/` folder with the following variables:
- `SESSION_SECRET`: key to use for signing cookies
- `PGUSER`: name of the PostgreSQL user and database that will be using the application
- `PGPASSWORD`: password of the PostgreSQL user that will be accessing the database
- `SPOTIFY_CLIENT_ID`: your Spotify application's client ID
- `SPOTIFY_CLIENT_SECRET`: your Spotify application's client secret
- `SPOTIFY_REDIRECT_URI`: the location Spotify will redirect to after authorizing the user account. This should be `[development server URL]/api/auth/callback`

Finally, add the table to your database:
- `psql [name of database] < node_modules/connect-pg-simple/table.sql`

Start the client and server by running:
- `yarn dev`