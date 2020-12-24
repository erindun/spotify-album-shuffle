import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Player from './components/Player';
import Login from './components/Login';
import { fetchAccessToken } from './utils/api';

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState('');
  const [expiresIn, setExpiresIn] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const data = await fetchAccessToken();
      const expiresIn = Date.parse(data.expires_at) - new Date().getTime();
      setExpiresIn(expiresIn);
      setAccessToken(data.token);
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
    if (expiresIn) {
      const interval = setInterval(() => {
        fetch();
      }, expiresIn);
      return () => clearInterval(interval);
    }
  }, [setAccessToken, fetch, expiresIn]);

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
              accessToken={accessToken}
              deleteAccessToken={() => setAccessToken('')}
            />
          </Route>
        )}
        <Redirect to="/" />
      </Box>
    </Router>
  );
};

export default App;
