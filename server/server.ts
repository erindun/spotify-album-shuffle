import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import connectPgSession from 'connect-pg-simple';
import { AccessToken } from 'common';
import { mapAlbumMetadata, SpotifyAlbumShuffleApi } from './utils';

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
const shuffleApi = new SpotifyAlbumShuffleApi(
  // TODO handle invalid Spotify API credentials
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!,
  process.env.SPOTIFY_REDIRECT_URI!
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
);

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
  const html = shuffleApi.spotifyApi.createAuthorizeURL(scopes, 'state');
  res.send(html);
});

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  const data = await shuffleApi.spotifyApi.authorizationCodeGrant(
    code as string
  );
  // console.log(data);
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
      shuffleApi.spotifyApi.setRefreshToken(sess.refresh_token);
      const newAccessTokenResponse =
        await shuffleApi.spotifyApi.refreshAccessToken();
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
    try {
      const albumObjects = await shuffleApi.fetchAllSavedAlbums(
        req.session.access_token
      );
      const albums = mapAlbumMetadata(albumObjects);
      res.send(albums);
    } catch (err) {
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
