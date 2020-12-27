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
    <Box minH="100vh" align="center">
      <Flex justify="center">
        <Button
          onClick={onReloadClicked}
          w={200}
          mt={10}
          mb={5}
          mr={3}
          disabled={loading}
        >
          {loading ? (
            'loading...'
          ) : (
            <>
              reload and reshuffle
              <RepeatIcon ml={3} />
            </>
          )}
        </Button>
        <Button onClick={onLogout} mt={10} mb={5} ml={3} bgColor="spotifyGreen">
          log out
        </Button>
      </Flex>

      <Box>
        {!(state.accessToken && currentAlbum) || loading ? (
          <Spinner mt={300} />
        ) : (
          <>
            <Text>now playing</Text>
            <Heading color="white" textAlign="center">
              {currentAlbum.name}
            </Heading>
            <Text>by</Text>
            <Heading color="white" textAlign="center">
              {currentAlbum.artist}
            </Heading>

            <Flex
              justify="center"
              align="center"
              pb={{ sm: 250, md: 150 }}
              h={600}
            >
              <Button
                onClick={() => setQueueIndex(queueIndex - 1)}
                disabled={queueIndex === 0}
                ml={30}
              >
                <ArrowBackIcon mr={{ sm: 0, md: 2 }} />
                <Text display={{ sm: 'none', md: 'block' }}>
                  previous album
                </Text>
              </Button>
              <Image
                w={{ sm: 350, md: 500 }}
                src={currentAlbum?.artworkUrl}
                alt=""
                px={{ sm: 25, md: 50 }}
              />
              <Button
                onClick={() => setQueueIndex(queueIndex + 1)}
                disabled={
                  albumsList.length
                    ? queueIndex === albumsList.length - 1
                    : true
                }
                mr={30}
              >
                <Text display={{ sm: 'none', md: 'block' }}>next album</Text>
                <ArrowForwardIcon ml={{ sm: 0, md: 2 }} />
              </Button>
            </Flex>
            <Box
              position="fixed"
              bottom={0}
              minW={{ sm: '99vw', md: '100vw' }}
              ml={{ sm: '0.2em', md: '0em' }}
            >
              <SpotifyPlayer
                token={state.accessToken.value}
                uris={currentAlbum.uri}
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
