import React, { useState, useEffect, useMemo } from 'react';
import theme from './theme';
import { Box, Button, Flex, Heading, Image } from '@chakra-ui/react';
import axios from 'axios';
import SpotifyPlayer from 'react-spotify-web-playback';

interface Album {
  uri: string;
  name: string;
  artist: string;
  artworkUrl: string;
}

const Player: React.FC = () => {
  const [accessToken, setAccessToken] = useState('');
  const [albumsList, setAlbumsList] = useState<Album[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentAlbum = useMemo(() => {
    if (queueIndex < 0) {
      return null;
    } else if (queueIndex >= albumsList.length) {
      return null;
    } else {
      return albumsList[queueIndex];
    }
  }, [queueIndex, albumsList]);

  // effect: fetch API access token
  useEffect(() => {
    const fetchAccessToken = async () => {
      const response = await axios.get<string>(
        'http://localhost:5000/api/token'
      );
      setAccessToken(response.data);
    };

    fetchAccessToken();
  }, []);

  // effect: fetch list of albums in user's library
  useEffect(() => {
    const fetchAlbumsList = async () => {
      setLoading(true);

      const response = await axios.get<any[]>(
        'http://localhost:5000/api/albums'
      );
      const albums = response.data.map(
        (album) =>
          ({
            uri: album.uri,
            name: album.name,
            artist: album.artists[0].name,
            artworkUrl: album.images[0].url,
          } as Album)
      );

      setAlbumsList(albums);
      setLoading(false);
    };

    fetchAlbumsList();
  }, []);

  // Chakra-UI theme values can't be passed to
  // `SpotifyPlayer`, so extract the colors directly
  const {
    spotifyBlack,
    spotifyMedGray,
    spotifyLightGray,
    spotifyGreen,
  } = theme.colors;

  return (
    currentAlbum && (
      <Flex
        direction="column"
        alignItems="center"
        justify="end"
        style={{ width: '100vw', minHeight: '100vh' }}
      >
        <Heading color="white" whiteSpace="pre-line" textAlign="center">
          {`${currentAlbum.artist}\n${currentAlbum.name}`}
        </Heading>
        <Flex alignItems="center" justify="" pb={150} pt={10}>
          <Button
            onClick={() => setQueueIndex(queueIndex - 1)}
            disabled={queueIndex === 0}
          >
            Previous
          </Button>
          <Image
            style={{ width: '500px' }}
            src={currentAlbum.artworkUrl}
            alt=""
            px={50}
          />
          <Button
            onClick={() => setQueueIndex(queueIndex + 1)}
            disabled={
              albumsList.length ? queueIndex === albumsList.length - 1 : true
            }
          >
            Next
          </Button>
        </Flex>
        <SpotifyPlayer
          token={accessToken}
          uris={currentAlbum.uri}
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
    )
  );
};

export default Player;
