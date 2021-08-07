import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    spotifyBlack: '#121212',
    spotifyDarkGray: '#212121',
    spotifyMedGray: '#535353',
    spotifyLightGray: '#b3b3b3',
    spotifyGreen: '#1db954',
  },
  config: {
    initialColorMode: 'dark',
  },
});
