import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import connectPgSession from 'connect-pg-simple';
import spotifyWebApi from 'spotify-web-api-node';

dotenv.config();
const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

// connect to database
const pgSession = connectPgSession(session);
const { Pool } = pg;
const pool = new Pool({
  user: process.env.PGUSER,
  host: 'localhost',
  database: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: 5432,
});
app.use(
  session({
    store: new pgSession({
      pool: pool,
    }),
    secret: process.env.SESSION_SECRET,
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
  const html = spotifyApi.createAuthorizeURL(scopes);
  res.send(html);
});

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  let data = await spotifyApi.authorizationCodeGrant(code);
  const { access_token, refresh_token, expires_in } = data.body;
  spotifyApi.setAccessToken(access_token);
  spotifyApi.setRefreshToken(refresh_token);
  req.session.refresh_token = refresh_token;

  const expires_at = new Date();
  expires_at.setTime(expires_at.getTime() + expires_in * 1000);
  req.session.expires_at = expires_at;

  res.redirect('http://localhost:3000/player');
});

app.get('/api/auth/token', async (req, res) => {
  const sess = req.session;
  if (sess.refresh_token && sess.expires_at) {
    if (new Date() > Date.parse(sess.expires_at)) {
      // if token has expired, refresh it
      const newAccessTokenResponse = await spotifyApi.refreshAccessToken();
      const { access_token, expires_in } = newAccessTokenResponse.body;

      const expires_at = new Date();
      expires_at.setTime(expires_at.getTime() + expires_in * 1000);
      sess.expires_at = expires_at;

      spotifyApi.setAccessToken(access_token);
    }
    res.json({
      token: spotifyApi.getAccessToken(),
      expires_at: sess.expires_at,
    });
  } else {
    // do not send token
    res.end();
  }
});

app.get('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.end();
});

app.get('/api/albums', async (req, res) => {
  try {
    let response = await spotifyApi.getMySavedAlbums({
      limit: 50,
      offset: 0,
    });
    const numAlbums = response.body.total;

    const albums = [];
    for (let i = 0; i < numAlbums; i += 50) {
      let data = await spotifyApi.getMySavedAlbums({
        limit: 50,
        offset: i,
      });

      let items = data.body.items;
      for (let item of items) {
        albums.push(item.album);
      }
    }

    res.json(albums);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
