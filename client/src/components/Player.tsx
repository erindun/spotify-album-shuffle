import { useEffect, useMemo, useState } from 'react';
import { theme } from '../theme';
import { Box, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import SpotifyPlayer, { CallbackState } from 'react-spotify-web-playback';
import { fetchAlbumsList, logout } from '../utils/api';
import { useLocalStorage } from '../utils/hooks';
import { Album } from 'common';
import { shuffle } from '../utils';
import { useQuery, useQueryClient } from 'react-query';
import { AlbumInfo } from './AlbumInfo';
import { PlayAlbumButton } from './PlayAlbumButton';

interface PlayerProps {
  accessToken: string;
}

export function Player({ accessToken }: PlayerProps): JSX.Element {
  const {
    data: albums,
    error: albumsError,
    isFetching,
    refetch,
  } = useQuery<Album[], Error>(
    'albums',
    async () => shuffle(await fetchAlbumsList()),
    {
      staleTime: 1000 * 3600 * 24, // 24 hours
    }
  );

  const [queueIndex, setQueueIndex] = useLocalStorage('queueIndex', 0);
  const currentAlbum = useMemo(
    () =>
      albums && queueIndex < albums.length ? albums[queueIndex] : undefined,
    [queueIndex, albums]
  );

  const [queued, setQueued] = useState<string[] | undefined>(undefined);
  useEffect(() => {
    if (albums) {
      const tracks: string[] = [];
      for (let i = queueIndex; i < albums.length && i < queueIndex + 2; i++) {
        tracks.push(...albums[i].uris);
      }
      setQueued(tracks);
    }
  }, [queueIndex, albums]);

  function onPlayerUpdate(state: CallbackState) {
    if (
      currentAlbum &&
      !currentAlbum.uris.includes(state.track.uri) &&
      state.previousTracks.length &&
      currentAlbum.uris.includes(state.previousTracks[0].uri)
    ) {
      setQueueIndex(queueIndex + 1);
    }
  }

  function onReload() {
    setQueueIndex(0);
    refetch();
  }

  const queryClient = useQueryClient();
  async function onLogout() {
    await logout();
    queryClient.invalidateQueries('accessToken');
  }

  // Chakra-UI theme values can't be passed to
  // `SpotifyPlayer`, so extract the colors directly
  const { spotifyBlack, spotifyMedGray, spotifyLightGray, spotifyGreen } =
    theme.colors;

  return (
    <Flex
      h="100%"
      textAlign="center"
      justifyContent="space-between"
      direction="column"
    >
      <Box mt="3rem">
        <Button
          onClick={onReload}
          w="12.5rem"
          mr="0.25rem"
          disabled={isFetching}
        >
          {isFetching ? (
            'Loading...'
          ) : (
            <>
              Reload and reshuffle
              <RepeatIcon ml="0.5rem" />
            </>
          )}
        </Button>
        <Button onClick={onLogout} ml="0.25rem" bgColor="spotifyGreen">
          Log out
        </Button>
      </Box>
      {albumsError ? (
        <Text>{albumsError}</Text>
      ) : !(currentAlbum && queued) || isFetching ? (
        <Flex justify="center" align="center">
          <Spinner />
        </Flex>
      ) : (
        <>
          <Flex justify="center" align="center" mt="1rem" mx="1rem">
            <PlayAlbumButton
              direction="previous"
              onClick={() => setQueueIndex(queueIndex - 1)}
              disabled={!albums || queueIndex === 0}
            />
            <AlbumInfo album={currentAlbum} />
            <PlayAlbumButton
              direction="next"
              onClick={() => setQueueIndex(queueIndex + 1)}
              disabled={!albums || queueIndex === albums.length - 1}
            />
          </Flex>
        </>
      )}
      <Box h="3rem">
        <SpotifyPlayer
          token={accessToken}
          uris={queued}
          autoPlay
          styles={{
            bgColor: spotifyBlack,
            color: spotifyLightGray,
            trackNameColor: spotifyLightGray,
            sliderHandleColor: spotifyLightGray,
            sliderColor: spotifyGreen,
            sliderTrackColor: spotifyMedGray,
          }}
          callback={onPlayerUpdate}
        />
      </Box>
    </Flex>
  );
}
