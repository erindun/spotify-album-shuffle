import { Flex, Box, Button, Text, Heading, Link } from '@chakra-ui/react';
import { fetchAuthUrl } from '../utils/api';
import { FaGithub } from 'react-icons/fa';
import { BiErrorCircle } from 'react-icons/bi';
import { useQuery } from 'react-query';

const Login: React.FC = () => {
  const { data: authUrl } = useQuery('authUrl', () => fetchAuthUrl());

  return (
    <Flex
      align="center"
      direction="column"
      justify="flex-start"
      width={['90%', '70%', '60%', '45%', '30%']}
      margin="auto"
    >
      <Heading mt="1.5rem">Spotify Album Shuffle</Heading>
      <Text mt="1.5rem">
        Spotify Album Shuffle connects with your Spotify account to generate and
        play a queue of all the albums saved in your library in a random order.
        If you have hundreds of albums saved, like me, hopefully this can
        alleviate the burden of having too many choices when you feel like
        listening to a full album. :)
      </Text>
      <Box>
        <a href={authUrl}>
          <Button
            leftIcon={!authUrl ? <BiErrorCircle /> : undefined}
            size="lg"
            mt="3rem"
            bg="spotifyGreen"
            to={authUrl}
            disabled={!authUrl}
          >
            {authUrl
              ? 'log in with Spotify'
              : "can't connect to Spotify server"}
          </Button>
        </a>
      </Box>
      <Text mt="4rem" fontSize="0.75rem">
        Note: Using the web player requires a Spotify Premium account. You can
        still use this application without a Premium account to generate a
        random list of albums, but unfortunately you will have to manually play
        it on another Spotify player.
      </Text>
      <Link
        mt={{ base: '1.5rem', sm: '4rem' }}
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
};

export default Login;
