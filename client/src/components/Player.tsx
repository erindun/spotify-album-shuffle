import { useEffect, useMemo, useRef, useState } from 'react';
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
import { shuffle } from '../utils';
import { useQuery } from 'react-query';
import { useAccessTokenQuery } from '../utils/hooks/queries';

export function Player(): JSX.Element {
  const { data: accessToken } = useAccessTokenQuery();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const closeAlertRef = useRef(null);
  const [seenAlert, setSeenAlert] = useLocalStorage('seenAlert', false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    data: albums,
    isFetching,
    refetch,
  } = useQuery<Album[], Error>('albums', async () =>
    shuffle(await fetchAlbumsList())
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
      {!(accessToken && currentAlbum && queued) || isFetching ? (
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
                  albums && albums.length
                    ? queueIndex === albums.length - 1
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
              token={accessToken.value}
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
}
