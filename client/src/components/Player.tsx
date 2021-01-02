import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import theme from '../theme';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Image,
  Spinner,
  useMediaQuery,
  AlertDialog,
  AlertDialogContent,
  useDisclosure,
  AlertDialogOverlay,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody,
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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const closeAlertRef = useRef(null);
  const [seenAlert, setSeenAlert] = useLocalStorage('seenAlert', false);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const queue = useMemo(() => {
    const tracks: string[] = [];
    for (let i = queueIndex; i < albumsList.length && i < queueIndex + 1; i++) {
      tracks.push(...albumsList[i].uris);
    }
    return tracks;
  }, [albumsList, queueIndex]);

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

  // effect: show alert modal if mobile is being used
  useEffect(() => {
    if (!isDesktop[0] && !seenAlert) {
      onOpen();
    }
  }, [isDesktop, seenAlert, onOpen]);

  function onReloadClicked() {
    setFetchAlbums(true);
    setQueueIndex(0);
    setLoading(true);
  }

  async function onPlayerUpdate(state: CallbackState) {
    if (
      currentAlbum &&
      !currentAlbum.uris.includes(state.track.uri) &&
      state.previousTracks.length &&
      currentAlbum.uris.includes(state.previousTracks[0].uri)
    ) {
      setQueueIndex(queueIndex + 1);
    }
  }

  function onCloseAlert() {
    setSeenAlert(true);
    onClose();
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
        {!(state.accessToken && currentAlbum && queue) || loading ? (
          <Spinner mt={{ base: '15rem', md: '20rem' }} />
        ) : (
          <>
            <Box mt={{ base: '0.25rem', sm: '2rem' }} h="11em">
              <Text display={{ base: 'none', sm: 'block' }}>now playing</Text>
              <Heading
                textOverflow="ellipsis"
                overflow="hidden"
                wordBreak="break-word"
                maxH="2.7em"
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
              mt={{ base: '-1.25rem', sm: '3rem' }}
            >
              <Button
                onClick={() => setQueueIndex(queueIndex - 1)}
                disabled={queueIndex === 0}
                mr="1rem"
              >
                <ArrowBackIcon mr={{ md: '0.5rem' }} />
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
                <ArrowForwardIcon ml={{ md: '0.5rem' }} />
              </Button>
            </Flex>
            <Box position="fixed" bottom={0} width="100%">
              <SpotifyPlayer
                token={state.accessToken.value}
                uris={queue}
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
      <AlertDialog
        isOpen={isOpen}
        onClose={onCloseAlert}
        leastDestructiveRef={closeAlertRef}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bgColor="spotifyDarkGray">
            <AlertDialogHeader>using mobile?</AlertDialogHeader>
            <AlertDialogBody>
              To listen on mobile, open the Spotify app on your device and
              select it from the menu.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={closeAlertRef} onClick={onCloseAlert}>
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Player;
