import { linter } from '@codemirror/lint';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Button, ButtonGroup, Card, Divider, Tab, Typography } from '@mui/material';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json5, json5ParseLinter } from 'codemirror-json5';
import { observer } from 'mobx-react';
import { useState } from 'react';
import Split from 'react-split';
import { protocolStore } from '../../store/ProtocolStore';
import SwaggerMetadata from '../../store/SwaggerMetadata';
import SchemaTable from '../SchemaTable';

const SocketEmitSection: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState<string>('2');
  const socketStore = protocolStore.socketStore;
  const eventInfo = socketStore.eventInfo;
  const namespace = eventInfo.namespace;
  const event = eventInfo.event;
  const eventDesc = SwaggerMetadata.getEvent(namespace, event)?.description ?? '';
  const requestSchema = socketStore.getRequestSchema();
  const responseSchema = socketStore.getResponseSchema();

  const handleChange = (_: React.SyntheticEvent, tab: string): void => setActiveTab(tab);

  const handleReset = async (): Promise<void> => {
    await socketStore.resetRequest();
  };

  const handleEmit = (): void => {
    socketStore.emitSocketEvent(namespace, event);
  };

  return (
    <Card style={{ height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        <div>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            namespace
          </Typography>
          <span style={{ fontWeight: 600 }}>{namespace}</span>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2, mr: 1 }}>
            event
          </Typography>
          <span style={{ fontWeight: 600 }}>{event}</span>
        </div>
        <div>
          <Button
            color="primary"
            variant="contained"
            size="small"
            sx={{ marginRight: 1 }}
            onClick={async () => {
              socketStore.setRequestBody(SwaggerMetadata.formatJson(socketStore.requestBody, requestSchema.schema));
            }}
            disableElevation
            disableFocusRipple
            disableRipple
          >
            Format
          </Button>
          <ButtonGroup variant="contained" size="small" disableElevation disableFocusRipple disableRipple>
            <Button color="error" onClick={handleReset}>
              Reset
            </Button>
            <Button color="success" onClick={handleEmit}>
              Emit
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <Divider />
      <Split direction="vertical" style={{ height: '95%' }} expandToMin gutterSize={5} sizes={[70, 30]}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TabContext value={activeTab}>
            <TabList onChange={handleChange} textColor="inherit">
              <Tab label="Request Schema" value="0" />
              <Tab label="Response Schema" value="1" />
              <Tab label="Body" value="2" />
            </TabList>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <TabPanel value="0" className="swagger-panel cusror-text">
                <SchemaTable name={requestSchema?.name ?? ''} schema={requestSchema?.schema} />
              </TabPanel>
              <TabPanel value="1" className="swagger-panel cusror-text">
                <SchemaTable name={responseSchema?.name ?? ''} schema={responseSchema?.schema} />
              </TabPanel>
              <TabPanel value="2" className="swagger-panel cusror-text">
                <ReactCodeMirror value={socketStore.requestBody} extensions={[json5(), EditorView.lineWrapping, linter(json5ParseLinter())]} onChange={(value) => socketStore.setRequestBody(value)} />
              </TabPanel>
            </div>
          </TabContext>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body1" padding={1}>
            Description
          </Typography>
          <Divider />
          <Typography padding={2} whiteSpace={'pre-wrap'} height={'100%'} overflow={'auto'}>
            {eventDesc}
          </Typography>
        </div>
      </Split>
    </Card>
  );
});

export default SocketEmitSection;
