import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Player from './components/Player';
import Login from './components/Login';
import { useAccessTokenQuery } from './utils/hooks/queries';

const App: React.FC = () => {
  const { data: accessToken } = useAccessTokenQuery();

  return (
    <Router>
      <Box bg="spotifyDarkGray" h="100vh">
        <Switch>
          <Route exact path="/">
            {accessToken ? <Redirect to="/player" /> : <Login />}
          </Route>
          {accessToken ? (
            <Route exact path="/player">
              <Player />
            </Route>
          ) : null}
          <Redirect to="/" />
        </Switch>
      </Box>
    </Router>
  );
};

export default App;
