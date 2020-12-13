import axios from 'axios';
import { Album } from '../components/Player';

const apiUrl = 'http://localhost:5000/api';

async function fetch<T>(url: string) {
  let attempted = 0;
  do {
    try {
      const response = await axios.get<T>(url);
      return response;
    } catch (err) {
      if (attempted) throw err;
      else {
        // TODO refresh access token
      }
    }
  } while (!attempted++);

  return Promise.reject();
}

export async function fetchAuthUrl(): Promise<string> {
  const response = await fetch<string>(`${apiUrl}/auth`);
  return response.data;
}

export async function fetchAlbumsList(): Promise<Album[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await fetch<any[]>(`${apiUrl}/albums`);
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

export async function fetchAccessToken(): Promise<string> {
  const response = await axios.get<string>(`${apiUrl}/token`);
  return response.data;
}
