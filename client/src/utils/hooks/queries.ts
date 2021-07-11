import { AccessToken } from 'common';
import { useQuery, UseQueryResult } from 'react-query';
import { fetchAccessToken } from '../api';

export function useAccessTokenQuery(): UseQueryResult<AccessToken, Error> {
  return useQuery<AccessToken, Error>('accessToken', () => fetchAccessToken(), {
    refetchInterval: 1000 * 3600, // 1 hour
    refetchIntervalInBackground: true,
  });
}
