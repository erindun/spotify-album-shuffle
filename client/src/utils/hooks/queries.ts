import { useQuery, UseQueryResult } from 'react-query';
import { fetchAccessToken } from '../api';

export function useAccessToken(): UseQueryResult<string, Error> {
  return useQuery<string, Error>('accessToken', () => fetchAccessToken(), {
    refetchInterval: (1000 * 3600) / 2, // 30 minutes
    refetchIntervalInBackground: true,
  });
}
