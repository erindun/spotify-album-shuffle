import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { Button, ButtonProps } from '@chakra-ui/react';

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
    <Button aria-label={`${isPrevious ? 'Previous' : 'Next'} album`} {...props}>
      <Icon />
    </Button>
  );
}
