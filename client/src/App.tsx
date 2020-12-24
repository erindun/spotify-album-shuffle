import React, { useEffect, useCallback, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Player from './components/Player';
import Login from './components/Login';
import { fetchAccessToken } from './utils/api';
import useLocalStorage from './utils/useLocalStorage';
import { AccessToken } from 'common';

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useLocalStorage<AccessToken | null>(
    'accessToken',
    null
  );
  const tokenExpiresIn = useMemo(() => {
    if (accessToken && accessToken.expiresAt) {
      const val = Date.parse(accessToken.expiresAt) - new Date().getTime();
      if (val > 0) {
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
  }, [setAccessToken]);

  // effect: retrieve an access token
  // from the server when the app starts
  useEffect(() => {
    if (!(accessToken || tokenExpiresIn)) {
      fetch();
    }
  }, [fetch, accessToken, tokenExpiresIn]);

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
        <Switch>
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
        </Switch>
      </Box>
    </Router>
  );
};

export default App;
