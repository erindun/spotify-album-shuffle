import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import connectPgSession from 'connect-pg-simple';
import spotifyWebApi from 'spotify-web-api-node';
import { AccessToken, Album } from 'common';

let clientUrl = 'https://spotifyalbumshuffle.com';
if (process.env.NODE_ENV === 'development') {
  clientUrl = 'http://localhost:3000';
}

declare module 'express-session' {
  export interface SessionData {
    refresh_token: string;
    access_token: string;
    expires_at: string;
  }
}

dotenv.config();
const app = express();
app.use(cors({ credentials: true, origin: clientUrl }));

// connect to database
const pgSession = connectPgSession(session);
const { Pool } = pg;
const pool = new Pool({
  user: process.env.PGUSER,
  host: 'localhost',
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: 5432,
});
app.use(
  session({
    store: new pgSession({
      pool: pool,
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  })
);

// configure Spotify API
const spotifyApi = new spotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});
const scopes = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
];

app.get('/api/auth', (req, res) => {
  const html = spotifyApi.createAuthorizeURL(scopes, 'state');
  res.send(html);
});

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  const data = await spotifyApi.authorizationCodeGrant(code as string);
  const { access_token, refresh_token, expires_in } = data.body;

  req.session.refresh_token = refresh_token;
  req.session.access_token = access_token;

  const expires_at = new Date();
  expires_at.setTime(expires_at.getTime() + expires_in * 1000);
  req.session.expires_at = expires_at.toISOString();

  res.redirect(`${clientUrl}/player`);
});

app.get('/api/auth/token', async (req, res) => {
  let accessToken = null;
  const sess = req.session;
  if (sess.refresh_token && sess.expires_at) {
    if (new Date() > new Date(sess.expires_at)) {
      // if token has expired, refresh it
      spotifyApi.setRefreshToken(sess.refresh_token);
      const newAccessTokenResponse = await spotifyApi.refreshAccessToken();
      const { access_token, expires_in } = newAccessTokenResponse.body;
      sess.access_token = access_token;

      const expires_at = new Date();
      expires_at.setTime(expires_at.getTime() + expires_in * 1000);
      sess.expires_at = expires_at.toISOString();
    }
    accessToken = {
      value: sess.access_token,
      expiresAt: sess.expires_at,
    } as AccessToken;
  }
  res.send(accessToken);
});

app.get('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.end();
  });
});

app.get('/api/albums', async (req, res) => {
  if (req.session.access_token) {
    spotifyApi.setAccessToken(req.session.access_token);
    try {
      const response = await spotifyApi.getMySavedAlbums({
        limit: 50,
        offset: 0,
      });
      const numAlbums = response.body.total;

      const items: SpotifyApi.SavedAlbumObject[] = [];
      for (let i = 0; i < numAlbums; i += 50) {
        const data = await spotifyApi.getMySavedAlbums({
          limit: 50,
          offset: i,
        });

        items.push(...data.body.items);
      }

      const albums = items.map(
        (item) =>
          ({
            uri: item.album.uri,
            name: item.album.name,
            artist: item.album.artists[0].name,
            artworkUrl: item.album.images[0].url,
            trackIds: item.album.tracks.items.map((item) => item.id),
          } as Album)
      );

      res.send(albums);
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  } else {
    res.end();
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
