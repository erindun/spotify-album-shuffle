import React, { useState, useEffect, useMemo } from 'react';
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
        (album: any) =>
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

  return (
    currentAlbum && (
      <>
        <img style={{ width: '400px' }} src={currentAlbum.artworkUrl} />
        <SpotifyPlayer
          token={accessToken}
          uris={currentAlbum.uri}
          styles={{
            bgColor: '#212121',
            color: '#b3b3b3',
            trackNameColor: '#b3b3b3',
            sliderHandleColor: '#b3b3b3',
            sliderColor: '#1db954',
            sliderTrackColor: '#535353',
          }}
        />
      </>
    )
  );
};

export default Player;
