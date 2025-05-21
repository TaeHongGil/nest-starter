import { AppBar, Box, Button, Dialog, DialogTitle, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Radio, Toolbar, Typography } from '@mui/material';
import ServerConfig from '@root/common/config/server.config';
import MessageUtil from '@root/common/util/message.util';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { protocolStore } from '../store/ProtocolStore';
import SwaggerMetadata from '../store/SwaggerMetadata';

const ServerSelect: React.FC<{ open: boolean; onClose: () => void }> = observer(({ open, onClose }) => {
  const [selectedServer, setSelectedServer] = React.useState<string>(protocolStore.activeServer);

  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth="md" slots={{ transition: React.Fragment }} slotProps={{ transition: { timeout: 0 } }}>
      <DialogTitle>Select Server</DialogTitle>
      <List>
        {Object.entries(SwaggerMetadata.servers ?? {}).map(([server, url]) => {
          if (!url.api) {
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
                onClick={async () => {
                  setSelectedServer(server);
                  await protocolStore.setActiveServer(server);
                  onClose();
                }}
                selected={selectedServer === server}
              >
                <ListItemIcon>
                  <Radio checked={selectedServer === server} value={server} />
                </ListItemIcon>
                <ListItemText
                  primary={server}
                  secondary={
                    <table>
                      <tbody>
                        <tr>
                          <td style={{ textAlign: 'right' }}>API</td>
                          <td>{url.api}</td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: 'right' }}>Socket</td>
                          <td>{url.socket}</td>
                        </tr>
                      </tbody>
                    </table>
                  }
                  secondaryTypographyProps={{ component: 'span' }}
                ></ListItemText>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Dialog>
  );
});

const SwaggerHeader = observer(() => {
  document.title = `${ServerConfig.server_name.toUpperCase()} - ${ServerConfig.server_type.toUpperCase()} ${protocolStore.mode.toUpperCase()} DOCUMENT ${SwaggerMetadata.config.version}`;
  const [serverDialogOpen, setServerDialogOpen] = React.useState(false);

  const setGlobalHeader = async (): Promise<void> => {
    const header = await MessageUtil.formDialogAsync('Global Header', toJS(protocolStore.globalHeader));
    if (!header) {
      return;
    }
    await protocolStore.setGlobalHeader(header);
  };

  return (
    <AppBar position="static" style={{ backgroundColor: '#3c3c3c', boxShadow: 'none' }}>
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
        <Button size="small" variant="contained" color="warning" onClick={async () => protocolStore.toggleMode()} disableRipple sx={{ marginRight: 1 }}>
          Change Swagger Mode - {protocolStore.mode.toUpperCase()}
        </Button>
        <Button size="small" variant="contained" color="error" onClick={async () => protocolStore?.resetAll()} disableRipple>
          Reset All
        </Button>
      </Toolbar>
      <ServerSelect open={serverDialogOpen} onClose={() => setServerDialogOpen(false)} />
    </AppBar>
  );
});

export default SwaggerHeader;
