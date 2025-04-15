import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import ServerConfig from '@root/common/config/server.config';
import { observer } from 'mobx-react';
import { SwaggerProps } from '../Swagger';

const SwaggerHeader = observer(({ store }: SwaggerProps) => {
  document.title = `${ServerConfig.server_type} Swagger`;

  return (
    <AppBar position="static" style={{ backgroundColor: '#3c3c3c' }}>
      <Toolbar variant="dense">
        <Typography variant="h6" flexGrow={1}>
          {document.title}
        </Typography>
        <Button variant="contained" color="error" onClick={() => store.resetLocalStorage()} disableRipple>
          Reset All
        </Button>
      </Toolbar>
    </AppBar>
  );
});

export default SwaggerHeader;
