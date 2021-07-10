import { Text, Image, Box, BoxProps } from '@chakra-ui/react';
import { Album } from 'common';

interface AlbumInfoProps extends BoxProps {
  album: Album;
}

export function AlbumInfo({ album }: AlbumInfoProps): JSX.Element {
  return (
    <Box>
      <Text h="4rem" w="16rem" textOverflow="ellipsis" fontWeight="bold">
        {album.name}
        <br />
        {album.artist}
      </Text>
      <Image
        w="12rem"
        h="12rem"
        mx="auto"
        my="1rem"
        src={album.artworkUrl}
        alt=""
      />
    </Box>
  );
}
