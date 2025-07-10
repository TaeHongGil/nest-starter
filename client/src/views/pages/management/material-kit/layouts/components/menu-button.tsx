import type { IconButtonProps } from '@mui/material/IconButton';

import IconButton from '@mui/material/IconButton';
import { Iconify } from '@root/views/pages/management/material-kit/components/iconify';

// ----------------------------------------------------------------------

export function MenuButton({ sx, ...other }: IconButtonProps) {
  return (
    <IconButton sx={sx} {...other}>
      <Iconify icon="custom:menu-duotone" width={24} />
    </IconButton>
  );
}
