import React, { useEffect, useCallback, useMemo, useContext } from 'react';
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
import { AccessTokenContext } from './utils/AccessTokenContext';

const App: React.FC = () => {
  const { state, dispatch } = useContext(AccessTokenContext);
  const tokenExpiresIn = useMemo(() => {
    if (state.accessToken && state.accessToken.expiresAt) {
      const val =
        Date.parse(state.accessToken.expiresAt) - new Date().getTime();
      if (val > 0) {
        return val;
      }
    }

    return undefined;
  }, [state.accessToken]);

  const fetch = useCallback(async () => {
    try {
      const data = await fetchAccessToken();
      dispatch({
        type: 'REFRESH',
        payload: data,
      });
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  // effect: retrieve an access token
  // from the server when the app starts
  useEffect(() => {
    if (!(state.accessToken || tokenExpiresIn)) {
      fetch();
    }
  }, [fetch, state.accessToken, tokenExpiresIn]);

  // effect: get a new access token
  // from the server when it expires
  useEffect(() => {
    if (tokenExpiresIn) {
      const interval = setInterval(() => {
        fetch();
      }, tokenExpiresIn);
      return () => clearInterval(interval);
    }
  }, [fetch, tokenExpiresIn]);

  return (
    <Router>
      <Box bg="spotifyDarkGray">
        <Switch>
          <Route exact path="/">
            {state.accessToken ? <Redirect to="/player" /> : <Login />}
          </Route>
          {state.accessToken && (
            <Route exact path="/player">
              <Player />
            </Route>
          )}
          <Redirect to="/" />
        </Switch>
      </Box>
    </Router>
  );
};

export default App;
