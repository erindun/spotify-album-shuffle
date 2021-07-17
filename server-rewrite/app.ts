import express from 'express';
import dotenv from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';
import { authRouter } from './routes/auth';
import { albumsRouter } from './routes/albums';

declare module 'express-session' {
  export interface SessionData {
    refresh_token: string;
    access_token: string;
    expires_at: string;
  }
}

export let clientUrl = 'https://spotifyalbumshuffle.com';
if (process.env.NODE_ENV === 'development') {
  clientUrl = 'http://localhost:3000';
}

dotenv.config();
const app = express();

export const spotifyApi = new SpotifyWebApi({
  // TODO handle invalid Spotify API credentials.
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  clientId: process.env.SPOTIFY_CLIENT_ID!,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI!,
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
});

app.use('/auth', authRouter);
app.use('/albums', albumsRouter);

const port = 5000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
