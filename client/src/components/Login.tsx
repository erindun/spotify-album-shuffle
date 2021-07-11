import {
  Flex,
  Box,
  Button,
  Text,
  Heading,
  Link,
  Spinner,
} from '@chakra-ui/react';
import { fetchAuthUrl } from '../utils/api';
import { FaGithub } from 'react-icons/fa';
import { BiErrorCircle } from 'react-icons/bi';
import { useQuery } from 'react-query';

export function Login(): JSX.Element {
  const { data: authUrl, error } = useQuery<string, Error>('authUrl', () =>
    fetchAuthUrl()
  );

  return (
    <Flex
      align="center"
      direction="column"
      h="100%"
      justify="center"
      width={['90%', '70%', '60%', '45%', '30%']}
      margin="auto"
    >
      <Heading my="0.75rem">Spotify Album Shuffle</Heading>
      <Text>
        Spotify Album Shuffle connects with your Spotify account to generate and
        play a queue of all the albums saved in your library in a random order.
        If you have hundreds of albums saved, like me, hopefully this can
        alleviate the burden of having too many choices when you feel like
        listening to a full album. :)
      </Text>
      <Box>
        <a href={authUrl}>
          <Button
            leftIcon={error ? <BiErrorCircle /> : undefined}
            size="lg"
            my="2.5rem"
            w="13rem"
            bg="spotifyGreen"
            to={authUrl}
            disabled={!authUrl}
          >
            {authUrl ? (
              'Log in with Spotify'
            ) : error ? (
              error.message
            ) : (
              <Spinner />
            )}
          </Button>
        </a>
      </Box>
      <Text fontSize="0.75rem">
        Note: Using the web player requires a Spotify Premium account. You can
        still use this application without a Premium account to generate a
        random list of albums, but unfortunately you will have to manually play
        it on another Spotify player.
      </Text>
      <Link
        mt="2rem"
        href="https://github.com/garrettdunc/spotify-album-shuffle"
        isExternal
      >
        <Flex>
          <FaGithub size="3rem" />
          <Text pt="0.75rem" pl="0.75rem">
            GitHub
          </Text>
        </Flex>
      </Link>
    </Flex>
  );
}
