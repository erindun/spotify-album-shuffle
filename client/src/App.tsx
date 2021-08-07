import { Flex, Spinner } from '@chakra-ui/react';
import { Player } from './components/Player';
import { Login } from './components/Login';
import { useAccessToken } from './utils/queries';

function App(): JSX.Element {
  const { data: accessToken, isLoading } = useAccessToken();

  return (
    <Flex h="100vh" bgColor="spotifyDarkGray" justify="center" align="center">
      {isLoading ? (
        <Spinner />
      ) : accessToken ? (
        <Player accessToken={accessToken} />
      ) : (
        <Login />
      )}
    </Flex>
  );
}

export default App;
