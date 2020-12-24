import axios from 'axios';
import { AccessToken } from 'common';
import { Album } from '../components/Player';

const apiUrl = 'http://localhost:5000/api';

export async function fetchAccessToken(): Promise<AccessToken | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await axios.get<any>(`${apiUrl}/auth/token`, {
    withCredentials: true,
  });
  let accessToken: AccessToken | null = null;
  if (response.data) {
    accessToken = {
      value: response.data.value,
      expiresAt: response.data.expires_at
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
  const albums = response.data.map(
    (album) =>
      ({
        uri: album.uri,
        name: album.name,
        artist: album.artists[0].name,
        artworkUrl: album.images[0].url,
      } as Album)
  );

  return albums;
}
