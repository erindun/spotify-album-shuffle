import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { Player } from './components/Player';
import { Login } from './components/Login';
import { fetchAuthStatus } from './utils/api';
import { useQuery } from 'react-query';

function App(): JSX.Element {
  const { data: isAuthorized } = useQuery('isAuthorized', () =>
    fetchAuthStatus()
  );

  return (
    <Router>
      <Box bg="spotifyDarkGray" h="100vh">
        <Switch>
          <Route exact path="/">
            {isAuthorized ? <Redirect to="/player" /> : <Login />}
          </Route>
          <Route exact path="/player">
            <Player />
          </Route>
          <Redirect to="/" />
        </Switch>
      </Box>
    </Router>
  );
}

export default App;
