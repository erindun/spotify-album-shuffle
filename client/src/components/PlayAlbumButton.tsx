import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { Button, ButtonProps, Text } from '@chakra-ui/react';

interface PlayAlbumButtonProps extends ButtonProps {
  direction: 'previous' | 'next';
}

export function PlayAlbumButton({
  direction,
  onClick,
  disabled,
}: PlayAlbumButtonProps): JSX.Element {
  const isPrevious = direction === 'previous';
  const Icon = isPrevious ? ArrowBackIcon : ArrowForwardIcon;

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      leftIcon={isPrevious ? <Icon /> : undefined}
      rightIcon={!isPrevious ? <Icon /> : undefined}
    >
      <Text display={{ base: 'none', md: 'block' }}>
        {isPrevious ? 'previous' : 'next'} album
      </Text>
    </Button>
  );
}
