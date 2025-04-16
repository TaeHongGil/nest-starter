import { json } from '@codemirror/lang-json';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { ButtonGroup, Card, Divider, Menu, MenuItem, Button as MuiButton, Tab, Typography } from '@mui/material';
import CommonUtil from '@root/common/util/common.util';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { SwaggerStore } from '../store/SwaggerStore';

interface SwaggerResponseProps {
  store: SwaggerStore;
}

const ResponseSection = observer(({ store }: SwaggerResponseProps) => {
  const [responseActiveTab, setResponseActiveTab] = useState<string>('body');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleChange = (event: React.SyntheticEvent, tab: string) => {
    setResponseActiveTab(tab);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        <Typography>Response</Typography>
        <ButtonGroup variant="contained" size="small" disableElevation disableFocusRipple disableRipple>
          <MuiButton color="info" onClick={handleMenuOpen} className="text-white">
            History
          </MuiButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {store.getHistory().map((item, index) => (
              <MenuItem
                key={`${index}`}
                onClick={async () => {
                  await store.updateCurrentApiData(item.data);
                  store.updateRequestBody(item.data.request.body);
                  store.updateRequestQuery(item.data.request.query);
                  handleMenuClose();
                }}
              >
                {item.date}
              </MenuItem>
            ))}
          </Menu>
          <MuiButton
            color="primary"
            onClick={() => {
              CommonUtil.copyToClipboard(store.getCurrentData().response.body);
            }}
          >
            Copy
          </MuiButton>
        </ButtonGroup>
      </div>
      <Divider />
      <div style={{ height: '95%', display: 'flex', flexDirection: 'column' }}>
        <TabContext value={responseActiveTab}>
          <TabList onChange={handleChange} textColor="inherit">
            <Tab label="Header" value="headers" />
            <Tab label="Body" value="body" />
          </TabList>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <TabPanel value="headers" className="swagger-panel">
              <ReactCodeMirror value={store.getCurrentData().response.headers || 'not found data'} extensions={[json(), EditorView.lineWrapping]} readOnly />
            </TabPanel>
            <TabPanel value="body" className="swagger-panel">
              <ReactCodeMirror value={store.getCurrentData().response.body || 'not found data'} extensions={[json(), EditorView.lineWrapping]} readOnly />
            </TabPanel>
          </div>
        </TabContext>
      </div>
    </Card>
  );
});

export default ResponseSection;
