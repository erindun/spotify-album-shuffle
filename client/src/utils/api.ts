import axios from 'axios';
import { Album } from 'common';

/** Fetch the current user's Spotify API access token. */
export async function fetchAccessToken(): Promise<string> {
  try {
    const response = await axios.get<string>('/api/auth/token', {
      withCredentials: true,
    });
    return response.data;
  } catch {
    throw new Error('Unable to retrieve access token');
  }
}

/** Fetch the URL for the application's Spotify auth login. */
export async function fetchAuthUrl(): Promise<string> {
  try {
    const response = await axios.get<string>('/api/auth/code-uri');
    return response.data;
  } catch {
    throw new Error("Can't connect to server");
  }
}

/** Log out of current user. */
export async function logout(): Promise<void> {
  await axios.get('/api/auth/logout', {
    withCredentials: true,
  });
}

/** Fetch all albums in the user's Spotify library. */
export async function fetchAlbumsList(): Promise<Album[]> {
  try {
    const response = await axios.get<Album[]>('/api/albums', {
      withCredentials: true,
    });
    return response.data;
  } catch {
    throw new Error('Unable to get albums');
  }
}
