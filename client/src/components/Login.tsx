import React, { useState, useEffect } from 'react';
import { Flex, Box, Button, Text, Heading, Link } from '@chakra-ui/react';
import { fetchAuthUrl } from '../utils/api';
import { FaGithub } from 'react-icons/fa';

const Login: React.FC = () => {
  const [authUrl, setAuthUrl] = useState('');

  // effect: fetch authorization URL
  useEffect(() => {
    let mounted = true;

    async function fetch() {
      try {
        const url = await fetchAuthUrl();
        if (mounted) {
          setAuthUrl(url);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetch();
    return function cleanup() {
      mounted = false;
    };
  }, []);

  return (
    <Flex
      minH="100vh"
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
      {!authUrl ? null : (
        <Box>
          <a href={authUrl}>
            <Button size="lg" mt="3rem" bg="spotifyGreen" to={authUrl}>
              log in with Spotify
            </Button>
          </a>
        </Box>
      )}
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
