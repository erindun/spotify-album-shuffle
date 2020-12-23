import React, { useState, useEffect } from 'react';
import { Flex, Button } from '@chakra-ui/react';
import { fetchAuthUrl } from '../utils/api';

const Login: React.FC = () => {
  const [authUrl, setAuthUrl] = useState('');

  // effect: fetch authorization URL
  useEffect(() => {
    async function fetch() {
      try {
        const url = await fetchAuthUrl();
        setAuthUrl(url);
      } catch (err) {
        console.error(err);
      }
    }

    fetch();
  }, []);

  return !authUrl ? null : (
    <Flex minH="100vh" alignItems="center" justify="center" direction="column">
      <a href={authUrl}>
        <Button
          size="lg"
          px="3em"
          py="1.5em"
          rounded="48px"
          bg="spotifyGreen"
          to={authUrl}
        >
          log in with Spotify
        </Button>
      </a>
    </Flex>
  );
};

export default Login;
