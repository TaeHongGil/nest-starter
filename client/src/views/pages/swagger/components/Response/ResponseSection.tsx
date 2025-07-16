import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Button, ButtonGroup, Card, Divider, Menu, MenuItem, Button as MuiButton, Tab, Typography } from '@mui/material';
import CommonUtil from '@root/common/util/common.util';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json5 } from 'codemirror-json5';
import { observer } from 'mobx-react';
import { useState } from 'react';
import { protocolStore } from '../../store/ProtocolStore';
import SwaggerMetadata from '../../store/SwaggerMetadata';
import SchemaTable from '../SchemaTable';

const ResponseSection = observer(() => {
  const [responseActiveTab, setResponseActiveTab] = useState<string>('body');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const httpSotre = protocolStore.httpStore;
  const responseSchema = httpSotre.getResponseSchema();
  const response = httpSotre.getCurrentApi().response;
  const responseBody = SwaggerMetadata.formatJson(response.body, responseSchema.schema, 'data');

  const handleChange = (event: React.SyntheticEvent, tab: string): void => {
    setResponseActiveTab(tab);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        <Typography>Response</Typography>
        <ButtonGroup variant="contained" size="small" disableElevation disableFocusRipple disableRipple>
          <Button color="info" onClick={handleMenuOpen} className="text-white">
            History
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            {httpSotre.getHistorys().map((item, index) => (
              <MenuItem
                key={`${index}`}
                onClick={async () => {
                  await httpSotre.setApiData(item.data);
                  httpSotre.setRequestBody(item.data.request.body);
                  httpSotre.setRequestQuery(item.data.request.query);
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
              CommonUtil.copyToClipboard(response.body);
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
            <Tab label="Schema" value="schema" />
            <Tab label="Header" value="headers" />
            <Tab label="Body" value="body" />
          </TabList>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <TabPanel value="schema" classes={{ root: 'swagger-panel' }}>
              <SchemaTable name={responseSchema.name ?? ''} schema={responseSchema.schema} />
            </TabPanel>
            <TabPanel value="headers" classes={{ root: 'swagger-panel cusror-text' }}>
              <ReactCodeMirror value={response.headers || 'not found data'} extensions={[json5(), EditorView.lineWrapping]} readOnly />
            </TabPanel>
            <TabPanel value="body" classes={{ root: 'swagger-panel cusror-text' }}>
              <ReactCodeMirror value={responseBody || 'not found data'} extensions={[json5(), EditorView.lineWrapping]} readOnly />
            </TabPanel>
          </div>
        </TabContext>
      </div>
    </Card>
  );
});

export default ResponseSection;
