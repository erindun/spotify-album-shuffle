import axios from 'axios';
import { AccessToken, Album } from 'common';

const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://spotifyalbumshuffle.com/api'
    : 'http://localhost:5000/api';

export async function fetchAccessToken(): Promise<AccessToken> {
  try {
    const response = await axios.get<AccessToken>(`${apiUrl}/auth/token`, {
      withCredentials: true,
    });
    return response.data;
  } catch {
    throw new Error('Unable to retrieve access token');
  }
}

export async function fetchAuthUrl(): Promise<string> {
  try {
    const response = await axios.get<string>(`${apiUrl}/auth`);
    return response.data;
  } catch {
    throw new Error("Can't connect to server");
  }
}

export async function logout(): Promise<void> {
  await axios.get(`${apiUrl}/auth/logout`, {
    withCredentials: true,
  });
}

export async function fetchAlbumsList(): Promise<Album[]> {
  try {
    const response = await axios.get<Album[]>(`${apiUrl}/albums`, {
      withCredentials: true,
    });
    return response.data;
  } catch {
    throw new Error('Unable to get albums');
  }
}
