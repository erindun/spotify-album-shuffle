import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Player from './components/Player';
import Login from './components/Login';
import { fetchAccessToken } from './utils/api';

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState('');

  // effect: fetch Spotify API access token
  useEffect(() => {
    async function fetch() {
      try {
        const token = await fetchAccessToken();
        setAccessToken(token);
      } catch (err) {
        console.error(err);
      }
    }

    fetch();
  }, []);

  return (
    <Router>
      <Box bg="spotifyDarkGray">
        <Route exact path="/">
          {accessToken ? <Redirect to="/player" /> : <Login />}
        </Route>
        <Route exact path="/player">
          <Player accessToken={accessToken} />
        </Route>
      </Box>
    </Router>
  );
};

export default App;
