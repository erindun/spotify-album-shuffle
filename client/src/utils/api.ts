import axios from 'axios';
import { Album } from 'common';

export async function fetchAuthStatus(): Promise<string> {
  try {
    const response = await axios.get<string>('/api/auth');
    return response.data;
  } catch {
    throw new Error("Can't connect to server");
  }
}

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

export async function fetchAuthUrl(): Promise<string> {
  try {
    const response = await axios.get<string>('/api/auth/code-uri');
    return response.data;
  } catch {
    throw new Error("Can't connect to server");
  }
}

export async function logout(): Promise<void> {
  await axios.get('/api/auth/logout', {
    withCredentials: true,
  });
}

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
