import express from 'express';
import { clientUrl, spotifyApi } from '../app';
import { AccessToken } from 'common';

/** Router for `/api/auth`. */
export const authRouter = express.Router();

/** Permission scopes for Spotify API. */
const scopes = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
];

/**
 * Returns a token expiration time as a `Date`.
 * @param expiresIn Time in ms until the token expires.
 * */
function getTokenExpirationTime(expiresIn: number): Date {
  const expiresAt = new Date();
  expiresAt.setTime(expiresAt.getTime() + expiresIn * 1000);
  return expiresAt;
}

/* GET authorization URL. */
authRouter.get('/', (req, res) => {
  const html = spotifyApi.createAuthorizeURL(scopes, 'state');
  res.send(html);
});

/* GET access token after authorization granted. */
authRouter.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code as string);
    const { access_token, refresh_token, expires_in } = data.body;
    const expiresAt = getTokenExpirationTime(expires_in);

    req.session.expires_at = expiresAt.toISOString();
    req.session.refresh_token = refresh_token;
    req.session.access_token = access_token;

    // Because we are using a proxy, redirect to player
    // using the absolute path.
    res.redirect(`${clientUrl}/player`);
  } catch (err) {
    res.send(err);
  }
});

/* GET current access token or refreshed access token if stale. */
authRouter.get('/token', async (req, res) => {
  const sess = req.session;
  if (sess.refresh_token && sess.expires_at && sess.access_token) {
    if (new Date() > new Date(sess.expires_at)) {
      try {
        // If token has expired, refresh it.
        spotifyApi.setRefreshToken(sess.refresh_token);
        const newAccessTokenResponse = await spotifyApi.refreshAccessToken();
        const { access_token, expires_in } = newAccessTokenResponse.body;
        const expiresAt = getTokenExpirationTime(expires_in);

        sess.access_token = access_token;
        sess.expires_at = expiresAt.toISOString();
      } catch (err) {
        res.send(err);
      }
    }

    const accessToken: AccessToken = {
      value: sess.access_token,
      expiresAt: sess.expires_at,
    };
    res.send(accessToken);
  } else {
    res.status(401);
  }
});

authRouter.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.end();
  });
});
