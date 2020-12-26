import axios from 'axios';
import { AccessToken } from 'common';
import { Album } from '../components/Player';

const apiUrl = 'http://localhost:5000/api';

export async function fetchAccessToken(): Promise<AccessToken | null> {
  const response = await axios.get<AccessToken | null>(`${apiUrl}/auth/token`, {
    withCredentials: true,
  });
  let accessToken: AccessToken | null = null;
  if (response.data) {
    accessToken = {
      value: response.data.value,
      expiresAt: response.data.expiresAt,
    } as AccessToken;
  }
  return accessToken;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await axios.get<any[]>(`${apiUrl}/albums`);
  return response.data;
}
