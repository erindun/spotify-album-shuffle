import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Player from './components/Player';
import Login from './components/Login';
import { fetchAccessToken } from './utils/api';
import { AccessToken } from 'common';

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<AccessToken | null>(null);
  const tokenExpiresIn = useMemo(() => {
    if (accessToken && accessToken.expiresAt) {
      console.log(accessToken.expiresAt);
      const val = accessToken.expiresAt.getTime() - new Date().getTime();
      if (val > 0){
        return val;
      }
    }

    return undefined;
  }, [accessToken]);

  const fetch = useCallback(async () => {
    try {
      const data = await fetchAccessToken();
      setAccessToken(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // effect: retrieve an access token
  // from the server when the app starts
  useEffect(() => {
    fetch();
  }, [fetch]);

  // effect: get a new access token
  // from the server when it expires
  useEffect(() => {
    if (tokenExpiresIn) {
      const interval = setInterval(() => {
        fetch();
      }, tokenExpiresIn);
      return () => clearInterval(interval);
    }
  }, [setAccessToken, fetch, tokenExpiresIn]);

  return (
    <Router>
      <Box bg="spotifyDarkGray">
        <Route exact path="/">
          {accessToken ? <Redirect to="/player" /> : <Login />}
          <Login />
        </Route>
        {accessToken && (
          <Route exact path="/player">
            <Player
              accessToken={accessToken.value}
              deleteAccessToken={() => setAccessToken(null)}
            />
          </Route>
        )}
        <Redirect to="/" />
      </Box>
    </Router>
  );
};

export default App;
