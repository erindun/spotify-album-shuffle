import express from 'express';
import path from 'path';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import connectPgSession from 'connect-pg-simple';
import SpotifyWebApi from 'spotify-web-api-node';
import { authRouter } from './routes/auth';
import { albumsRouter } from './routes/albums';

// Add additional properties to session store.
declare module 'express-session' {
  export interface SessionData {
    refresh_token: string;
    access_token: string;
    expires_at: string;
  }
}

export const clientUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://spotifyalbumshuffle.com'
    : 'http://localhost:3000';

dotenv.config();
const app = express();

app.use(cors({ credentials: true, origin: clientUrl }));

// Connect to database.
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  })
);

export const spotifyApi = new SpotifyWebApi({
  // TODO handle invalid Spotify API credentials.
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  clientId: process.env.SPOTIFY_CLIENT_ID!,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
});

// Set up API router.
const apiRouter = express.Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/albums', albumsRouter);
app.use('/api/', apiRouter);

// In production, serve the built React app.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

const port = 5000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
