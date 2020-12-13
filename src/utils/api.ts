import axios from 'axios';
import { Album } from '../components/Player';

const apiUrl = 'http://localhost:5000/api';

export async function fetchAuthUrl(): Promise<string> {
  const response = await axios.get<string>(`${apiUrl}/auth`);

  return response.data;
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

export async function fetchAccessToken(): Promise<string> {
  const response = await axios.get<string>(`${apiUrl}/token`);
  return response.data;
}
