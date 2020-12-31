import React, { useState, useEffect, useMemo, useContext } from 'react';
import theme from '../theme';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Image,
  Spinner,
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon, RepeatIcon } from '@chakra-ui/icons';
import SpotifyPlayer, { CallbackState } from 'react-spotify-web-playback';
import { fetchAlbumsList, logout } from '../utils/api';
import useLocalStorage from '../utils/useLocalStorage';
import { useHistory } from 'react-router-dom';
import { Album } from 'common';
import { AccessTokenContext } from '../utils/AccessTokenContext';

const Player: React.FC = () => {
  const { state, dispatch } = useContext(AccessTokenContext);
  const [albumsList, setAlbumsList] = useLocalStorage<Album[]>(
    'albumsList',
    []
  );
  const [queueIndex, setQueueIndex] = useLocalStorage('queueIndex', 0);
  const [loading, setLoading] = useState(false);
  const [fetchAlbums, setFetchAlbums] = useState(!albumsList.length);

  const currentAlbum = useMemo(() => {
    if (queueIndex < 0) {
      return null;
    } else if (queueIndex >= albumsList.length) {
      return null;
    } else {
      return albumsList[queueIndex];
    }
  }, [queueIndex, albumsList]);

  /** Shuffles an array in-place. */
  function shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // effect: fetch list of albums in user's library
  useEffect(() => {
    async function fetch() {
      setFetchAlbums(false);
      setLoading(true);
      try {
        const albums = await fetchAlbumsList();
        shuffle(albums);
        setAlbumsList(albums);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    if (fetchAlbums) {
      fetch();
    }
  }, [setAlbumsList, fetchAlbums]);

  function onReloadClicked() {
    setFetchAlbums(true);
    setQueueIndex(0);
    setLoading(true);
  }

  async function onPlayerUpdate(state: CallbackState) {
    if (state.error) {
      // TODO
    }
  }

  const history = useHistory();
  async function onLogout() {
    await logout();
    dispatch({ type: 'DELETE' });
    history.push('/');
  }

  // Chakra-UI theme values can't be passed to
  // `SpotifyPlayer`, so extract the colors directly
  const {
    spotifyBlack,
    spotifyMedGray,
    spotifyLightGray,
    spotifyGreen,
  } = theme.colors;

  return (
    <Box minH="100vh" textAlign="center">
      <Box pt={{ base: '1rem', sm: '2.5rem' }}>
        <Button
          onClick={onReloadClicked}
          w="12.5rem"
          mr="0.25rem"
          disabled={loading}
        >
          {loading ? (
            'loading...'
          ) : (
            <>
              reload and reshuffle
              <RepeatIcon ml="0.5rem" />
            </>
          )}
        </Button>
        <Button onClick={onLogout} ml="0.25rem" bgColor="spotifyGreen">
          log out
        </Button>
      </Box>
      <Box>
        {!(state.accessToken && currentAlbum) || loading ? (
          <Spinner mt={{ base: '15rem', md: '20rem' }} />
        ) : (
          <>
            <Box mt={{ base: '0.75rem', sm: '2rem' }} h="11em">
              <Text display={{ base: 'none', sm: 'block' }}>now playing</Text>
              <Heading
                textOverflow="ellipsis"
                overflow="hidden"
                wordBreak="break-word"
                maxH="4em"
              >
                {currentAlbum.name}
              </Heading>
              <Text>by</Text>
              <Heading
                textOverflow="ellipsis"
                overflow="hidden"
                wordBreak="break-word"
                maxH="1.5em"
              >
                {currentAlbum.artist}
              </Heading>
            </Box>
            <Flex
              justify="center"
              align="center"
              mt={{ base: '0.75rem', sm: '3rem' }}
            >
              <Button
                onClick={() => setQueueIndex(queueIndex - 1)}
                disabled={queueIndex === 0}
                mr="1rem"
              >
                <ArrowBackIcon mr={{ base: '0rem', md: '0.5rem' }} />
                <Text display={{ base: 'none', md: 'block' }}>
                  previous album
                </Text>
              </Button>
              <Image
                h={{ base: '14rem', sm: '18rem', md: '22rem' }}
                src={currentAlbum.artworkUrl}
                alt=""
              />
              <Button
                onClick={() => setQueueIndex(queueIndex + 1)}
                disabled={
                  albumsList.length
                    ? queueIndex === albumsList.length - 1
                    : true
                }
                ml="1rem"
              >
                <Text display={{ base: 'none', md: 'block' }}>next album</Text>
                <ArrowForwardIcon ml={{ base: '0rem', md: '0.5rem' }} />
              </Button>
            </Flex>
            <Box position="fixed" bottom={0} width="100%">
              <SpotifyPlayer
                token={state.accessToken.value}
                uris={currentAlbum.uri}
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default Player;
