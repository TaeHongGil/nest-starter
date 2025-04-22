import { AppBar, Box, Button, Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Radio, Toolbar, Typography } from '@mui/material';
import ServerConfig from '@root/common/config/server.config';
import MessageUtil from '@root/common/util/message.util';
import { observer } from 'mobx-react';
import React from 'react';
import { SwaggerProps } from '../Swagger';
import SwaggerMetadata from '../store/SwaggerMetadata';

const ServerSelect: React.FC<{ store: SwaggerProps['store']; open: boolean; onClose: () => void }> = observer(({ store, open, onClose }) => {
  const [selectedServer, setSelectedServer] = React.useState<string>(store.activeServer);

  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth="md" slots={{ transition: React.Fragment }} slotProps={{ transition: { timeout: 0 } }}>
      <DialogTitle>Select Server</DialogTitle>
      <List>
        {Object.entries(SwaggerMetadata.servers ?? {}).map(([server, url]) => {
          if (!url) {
            return null;
          }
          return (
            <ListItem
              disablePadding
              key={server}
              sx={{
                borderBottom: '1px solid #ddd',
              }}
            >
              <ListItemButton
                onClick={() => {
                  setSelectedServer(server);
                  store.updateActiveServer(server);
                  onClose();
                }}
                selected={selectedServer === server}
              >
                <ListItemIcon>
                  <Radio checked={selectedServer === server} value={server} />
                </ListItemIcon>
                <ListItemText primary={server} secondary={url} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Dialog>
  );
});

const SwaggerHeader = observer(({ store }: SwaggerProps) => {
  document.title = `${ServerConfig.server_name.toUpperCase()} - ${ServerConfig.server_type.toUpperCase()} API DOCUMENT ${SwaggerMetadata.config.version}`;
  const [serverDialogOpen, setServerDialogOpen] = React.useState(false);

  const setGlobalHeader = async () => {
    const header = await MessageUtil.formDialogAsync('Global Header', store.globalHeader);
    if (!header) {
      return;
    }
    store.updateGlobalHeader(header);
  };

  return (
    <AppBar position="static" style={{ backgroundColor: '#3c3c3c' }}>
      <Toolbar variant="dense">
        <Typography variant="h6" marginRight={2}>
          {document.title}
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Button size="small" variant="contained" color="primary" onClick={setGlobalHeader} disableRipple sx={{ marginRight: 1 }}>
            Global Header
          </Button>
          <Button size="small" variant="contained" color="info" onClick={() => setServerDialogOpen(true)} disableRipple sx={{ marginRight: 1 }}>
            Server
          </Button>
        </Box>
        <Button size="small" variant="contained" color="error" onClick={() => store.resetLocalStorage()} disableRipple>
          Reset All
        </Button>
      </Toolbar>
      <ServerSelect store={store} open={serverDialogOpen} onClose={() => setServerDialogOpen(false)} />
    </AppBar>
  );
});

export default SwaggerHeader;
