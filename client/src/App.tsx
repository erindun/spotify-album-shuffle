import { Box, Spinner } from '@chakra-ui/react';
import { Player } from './components/Player';
import { Login } from './components/Login';
import { useAccessToken } from './utils/hooks/queries';

function App(): JSX.Element {
  const { data: accessToken, isLoading } = useAccessToken();

  if (isLoading) return <Spinner />;

  return (
    <Box h="100vh">
      {accessToken ? <Player accessToken={accessToken} /> : <Login />}
    </Box>
  );
}

export default App;
