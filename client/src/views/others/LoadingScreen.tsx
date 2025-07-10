import { Box, Typography } from '@mui/material';
import { ReactElement } from 'react';

export default function LoadingScreen(): ReactElement {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Box>
        <Typography variant="h5" align="center">
          Loading...
        </Typography>
      </Box>
    </Box>
  );
}
