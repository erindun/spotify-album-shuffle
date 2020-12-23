import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
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
import SpotifyPlayer from 'react-spotify-web-playback';
import { fetchAlbumsList, fetchAccessToken, logout } from '../utils/api';
import useLocalStorage from '../utils/useLocalStorage';

export interface Album {
  uri: string;
  name: string;
  artist: string;
  artworkUrl: string;
}

const Player: React.FC = () => {
  const [albumsList, setAlbumsList] = useLocalStorage<Album[]>(
    'albumsList',
    []
  );
  const [queueIndex, setQueueIndex] = useLocalStorage('queueIndex', 0);
  const [accessToken, setAccessToken] = useState('');
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

  // effect: retrieve an access token from the server
  // each hour, and upon loading the player
  useEffect(() => {
    async function fetch() {
      try {
        const token = await fetchAccessToken();
        setAccessToken(token);
      } catch (err) {
        console.error(err);
      }
    }

    fetch();
    const interval = setInterval(() => {
      fetch();
    }, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

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

  const history = useHistory();
  function onLogout() {
    history.push('/');
    logout();
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
          mr={2.5}
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
        {!accessToken || loading ? (
          <Spinner mt={300} />
        ) : (
          <>
            <Text>now playing</Text>
            <Heading color="white" textAlign="center">
              {currentAlbum?.name}
            </Heading>
            <Text>by</Text>
            <Heading color="white" textAlign="center">
              {currentAlbum?.artist}
            </Heading>

            <Flex justify="center" align="center" pb={150} pt={10} h={600}>
              <Button
                onClick={() => setQueueIndex(queueIndex - 1)}
                disabled={queueIndex === 0}
              >
                <ArrowBackIcon mr={2} />
                previous album
              </Button>
              <Image w={500} src={currentAlbum?.artworkUrl} alt="" px={50} />
              <Button
                onClick={() => setQueueIndex(queueIndex + 1)}
                disabled={
                  albumsList.length
                    ? queueIndex === albumsList.length - 1
                    : true
                }
              >
                next album
                <ArrowForwardIcon ml={2} />
              </Button>
            </Flex>
            <Box position="fixed" bottom={0} minW="100vw">
              <SpotifyPlayer
                token={accessToken}
                uris={currentAlbum?.uri}
                autoPlay
                styles={{
                  bgColor: spotifyBlack,
                  color: spotifyLightGray,
                  trackNameColor: spotifyLightGray,
                  sliderHandleColor: spotifyLightGray,
                  sliderColor: spotifyGreen,
                  sliderTrackColor: spotifyMedGray,
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Player;
