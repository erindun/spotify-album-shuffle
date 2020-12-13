import React, { useState, useEffect, useMemo } from 'react';
import theme from '../theme';
import { Button, Flex, Heading, Image, Spinner } from '@chakra-ui/react';
import SpotifyPlayer from 'react-spotify-web-playback';
import { fetchAccessToken, fetchAlbumsList } from '../utils/api';
import useLocalStorage from '../utils/useLocalStorage';

export interface Album {
  uri: string;
  name: string;
  artist: string;
  artworkUrl: string;
}

const Player: React.FC = () => {
  const [accessToken, setAccessToken] = useState('');
  const [albumsList, setAlbumsList] = useLocalStorage<Album[]>(
    'albumsList',
    []
  );
  const [queueIndex, setQueueIndex] = useState(0);
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

  // effect: fetch API access token
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

  // Chakra-UI theme values can't be passed to
  // `SpotifyPlayer`, so extract the colors directly
  const {
    spotifyBlack,
    spotifyMedGray,
    spotifyLightGray,
    spotifyGreen,
  } = theme.colors;

  return (
    <Flex minH="100vh" align="center" direction="column">
      <Button
        onClick={() => setFetchAlbums(true)}
        w={200}
        alignSelf="end"
        mt={10}
        mr={5}
        disabled={loading}
      >
        {!loading ? 'Reload album library' : <Spinner />}
      </Button>
      <Heading color="white" whiteSpace="pre-line" textAlign="center">
        {`${currentAlbum?.artist}
        ${currentAlbum?.name}`}
      </Heading>
      <Flex alignItems="center" pb={150} pt={10} h={600}>
        <Button
          onClick={() => setQueueIndex(queueIndex - 1)}
          disabled={queueIndex === 0}
        >
          Previous album
        </Button>
        <Image w={500} src={currentAlbum?.artworkUrl} alt="" px={50} />
        <Button
          onClick={() => setQueueIndex(queueIndex + 1)}
          disabled={
            albumsList.length ? queueIndex === albumsList.length - 1 : true
          }
        >
          Next album
        </Button>
      </Flex>
      <SpotifyPlayer
        token={accessToken}
        uris={currentAlbum?.uri}
        styles={{
          bgColor: spotifyBlack,
          color: spotifyLightGray,
          trackNameColor: spotifyLightGray,
          sliderHandleColor: spotifyLightGray,
          sliderColor: spotifyGreen,
          sliderTrackColor: spotifyMedGray,
        }}
      />
    </Flex>
  );
};

export default Player;
