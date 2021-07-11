import { AccessToken } from 'common';
import { useQuery, UseQueryResult } from 'react-query';
import { fetchAccessToken } from '../api';

export function useAccessTokenQuery(): UseQueryResult<AccessToken, Error> {
  const oneHour = 1000 * 3600;

  return useQuery<AccessToken, Error>('accessToken', () => fetchAccessToken(), {
    staleTime: oneHour,
    refetchInterval: oneHour,
    refetchIntervalInBackground: true,
  });
}
