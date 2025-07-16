import { CONFIG } from '@root/views/pages/management/material-kit/config-global';

import { Box, Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function Page403() {
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <title>{`403 Forbidden - ${CONFIG.appName}`}</title>
      <Typography variant="h2" color="error" gutterBottom>
        403 Forbidden
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
        이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.
      </Typography>
    </Box>
  );
}
