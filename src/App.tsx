import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Player from './components/Player';
import Login from './components/Login';

const App: React.FC = () => {
  return (
    <Router>
      <Box bg="spotifyDarkGray">
        <Route exact path="/" component={Login} />
        <Route exact path="/player" component={Player} />
      </Box>
    </Router>
  );
};

export default App;
