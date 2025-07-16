import { CONFIG } from '@root/views/pages/management/material-kit/config-global';

import { Box, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function PageServerError() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <title>{`Server Error - ${CONFIG.appName}`}</title>
      <Typography variant="h2" color="error" gutterBottom>
        Server Error
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
        서버에서 정보를 받아올수없습니다.
      </Typography>
    </Box>
  );
}
