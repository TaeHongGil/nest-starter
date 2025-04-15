import { Cancel as XCircleIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Box textAlign="center">
        <XCircleIcon style={{ fontSize: '9rem', marginBottom: '1rem' }} />
        <Typography variant="h4" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" style={{ maxWidth: '500px', margin: '0 auto', marginBottom: '1rem' }}>
          You have accessed an incorrect path
        </Typography>
      </Box>
    </Box>
  );
}
