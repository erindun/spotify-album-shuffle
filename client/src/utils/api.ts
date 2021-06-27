import axios from 'axios';
import { AccessToken, Album } from 'common';

const apiUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://spotifyalbumshuffle.com/api'
    : 'http://localhost:5000/api';

export async function fetchAccessToken(): Promise<AccessToken> {
  const response = await axios.get<AccessToken>(`${apiUrl}/auth/token`, {
    withCredentials: true,
  });
  if (!response.data) {
    return Promise.reject(new Error('Error fetching access token'));
  } else {
    return response.data;
  }
}

export async function fetchAuthUrl(): Promise<string> {
  const response = await axios.get<string>(`${apiUrl}/auth`);
  return response.data;
}

export async function logout(): Promise<void> {
  await axios.get(`${apiUrl}/auth/logout`, {
    withCredentials: true,
  });
}

export async function fetchAlbumsList(): Promise<Album[]> {
  const response = await axios.get<Album[]>(`${apiUrl}/albums`, {
    withCredentials: true,
  });
  return response.data;
}
