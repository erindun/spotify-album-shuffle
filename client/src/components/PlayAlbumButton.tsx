import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { Button, ButtonProps, Text } from '@chakra-ui/react';

interface PlayAlbumButtonProps extends ButtonProps {
  direction: 'previous' | 'next';
}

export function PlayAlbumButton({
  direction,
  ...props
}: PlayAlbumButtonProps): JSX.Element {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? ArrowBackIcon : ArrowForwardIcon;

  return (
    <Button
      leftIcon={isPrevious ? <Icon /> : undefined}
      rightIcon={!isPrevious ? <Icon /> : undefined}
      {...props}
    >
      <Text display={{ base: 'none', md: 'block' }}>
        {isPrevious ? 'Previous' : 'Next'} album
      </Text>
    </Button>
  );
}
