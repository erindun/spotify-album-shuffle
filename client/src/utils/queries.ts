import { useQuery, UseQueryResult } from 'react-query';
import { fetchAccessToken, fetchAlbums, fetchAuthUrl } from './api';
import { shuffle } from './utils';

/** Query hook for {@link fetchAccessToken}. */
export function useAccessToken(): UseQueryResult<string, Error> {
  return useQuery<string, Error>('accessToken', () => fetchAccessToken(), {
    refetchInterval: (1000 * 3600) / 2, // 30 minutes
    refetchIntervalInBackground: true,
  });
}

/** Query hook for {@link fetchAlbums}. */
export function useAlbums(): UseQueryResult<Album[], Error> {
  return useQuery<Album[], Error>(
    'albums',
    async () => shuffle(await fetchAlbums()),
    {
      staleTime: 1000 * 3600 * 24, // 24 hours
    }
  );
}

/** Query hook for {@link fetchAuthUrl}. */
export function useAuthUrl(): UseQueryResult<string, Error> {
  return useQuery<string, Error>('authUrl', () => fetchAuthUrl());
}
