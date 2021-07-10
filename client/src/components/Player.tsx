import React, { useEffect, useMemo, useContext, useRef } from 'react';
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
import { useLocalStorage } from '../utils/hooks';
import { useHistory } from 'react-router-dom';
import { Album } from 'common';
import { AccessTokenContext } from '../utils/AccessTokenContext';
import { shuffle } from '../utils';
import { useQuery } from 'react-query';

const Player: React.FC = () => {
  const { state, dispatch } = useContext(AccessTokenContext);
  const [queueIndex, setQueueIndex] = useLocalStorage('queueIndex', 0);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const closeAlertRef = useRef(null);
  const [seenAlert, setSeenAlert] = useLocalStorage('seenAlert', false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    data: albumsList,
    isFetching,
    refetch,
  } = useQuery<Album[], Error>('albums', async () => {
    const albums = await fetchAlbumsList();
    shuffle(albums);
    return albums;
  });

  const currentAlbum = useMemo(
    () =>
      albumsList && queueIndex < albumsList.length
        ? albumsList[queueIndex]
        : undefined,
    [queueIndex, albumsList]
  );

  const queue = useMemo(() => {
    if (albumsList) {
      const tracks: string[] = [];
      for (
        let i = queueIndex;
        i < albumsList.length && i < queueIndex + 2;
        i++
      ) {
        tracks.push(...albumsList[i].uris);
      }
      return tracks;
    }
  }, [albumsList, queueIndex]);

  // effect: show alert modal if mobile is being used
  useEffect(() => {
    if (!isDesktop[0] && !seenAlert) {
      onOpen();
    }
  }, [isDesktop, seenAlert, onOpen]);

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
  const { spotifyBlack, spotifyMedGray, spotifyLightGray, spotifyGreen } =
    theme.colors;

  return (
    <Flex textAlign="center" justifyContent="space-between" direction="column">
      <Box pt={{ base: '1rem' }}>
        <Button
          onClick={() => refetch()}
          w="12.5rem"
          mr="0.25rem"
          disabled={isFetching}
        >
          {isFetching ? (
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
      {!(state.accessToken && currentAlbum && queue) || isFetching ? (
        <Box mt={{ base: '15rem', md: '20rem' }} mx="auto" w="100%">
          <Spinner />
        </Box>
      ) : (
        <>
          <Box>
            <Box mt={{ base: '0.5rem', sm: '1rem' }}>
              <Text display={{ base: 'none', md: 'block' }}>now playing</Text>
              <Heading
                fontSize="1.5rem"
                textOverflow="ellipsis"
                overflow="hidden"
                wordBreak="break-word"
              >
                {currentAlbum.name}
              </Heading>
              <Text>by</Text>
              <Heading
                fontSize="1.5rem"
                textOverflow="ellipsis"
                overflow="hidden"
                wordBreak="break-word"
              >
                {currentAlbum.artist}
              </Heading>
            </Box>
            <Flex justify="center" align="center" mt="1rem">
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
                h={{ base: '12rem' }}
                src={currentAlbum.artworkUrl}
                alt=""
              />
              <Button
                onClick={() => setQueueIndex(queueIndex + 1)}
                disabled={
                  albumsList && albumsList.length
                    ? queueIndex === albumsList.length - 1
                    : true
                }
                ml="1rem"
              >
                <Text display={{ base: 'none', md: 'block' }}>next album</Text>
                <ArrowForwardIcon ml={{ md: '0.5rem' }} />
              </Button>
            </Flex>
          </Box>
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
              select it from the web player's Connect menu.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={closeAlertRef} onClick={onCloseAlert}>
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};

export default Player;
