/** Fetch the current user's Spotify API access token. */
export async function fetchAccessToken(): Promise<string> {
  try {
    const response = await fetch('/api/auth/token', {
      credentials: 'same-origin',
    });
    if (!response.ok) throw response;
    // Use `Response.text`, because `Response.json`
    // is unable to handle null responses and
    // `/api/auth/token` returns null if no token
    // for the user is available.
    return response.text();
  } catch (err) {
    throw new Error(err.message);
  }
}

/** Fetch the URL for the application's Spotify auth login. */
export async function fetchAuthUrl(): Promise<string> {
  try {
    const response = await fetch('/api/auth/code-uri');
    if (!response.ok) throw response;
    return response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}

/** Log out of current user. */
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    credentials: 'same-origin',
  });
}

/** Fetch all albums in the user's Spotify library. */
export async function fetchAlbumsList(): Promise<Album[]> {
  try {
    const response = await fetch('/api/albums', {
      credentials: 'same-origin',
    });
    if (!response.ok) throw response;
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}
