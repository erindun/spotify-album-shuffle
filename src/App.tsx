import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Player from './Player';
import Login from './Login';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Route exact path="/" component={Login} />
        <Route exact path="/player" component={Player} />
      </div>
    </Router>
  );
};

export default App;
