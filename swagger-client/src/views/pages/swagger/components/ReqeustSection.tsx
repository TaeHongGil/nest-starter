import { linter } from '@codemirror/lint';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Button, ButtonGroup, Card, Divider, Tab, Typography } from '@mui/material';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json5, json5ParseLinter } from 'codemirror-json5';
import { observer } from 'mobx-react';
import { useState } from 'react';
import Split from 'react-split';
import { SwaggerProps } from '../Swagger';
import { MethodTag } from './MethodTag';

const ReqeustSection = observer(({ store }: SwaggerProps) => {
  const [requestActiveTab, setRequestActiveTab] = useState('body');

  const handleChange = (event: React.SyntheticEvent, tab: string) => {
    setRequestActiveTab(tab);
  };

  const renderDescription = (description: string) => {
    const urlRegex = /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$\-@\.&+:\/?_#]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/g;
    const matches = description.match(urlRegex) || [];
    const parts = description.split(urlRegex);

    return parts
      .flatMap((part, index) => [
        <span key={`text-${index}`}>{part}</span>,
        matches[index] && (
          <a href={matches[index]} key={`link-${index}`} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
            {matches[index]}
          </a>
        ),
      ])
      .filter(Boolean);
  };

  return (
    <Card style={{ height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        <div>
          <MethodTag method={store.pathData.method} />
          <span>{store.pathData.path}</span>
        </div>
        <div>
          <Button
            color="primary"
            variant="contained"
            size="small"
            sx={{ marginRight: 1 }}
            onClick={async () => {
              store.formatRequestBody();
            }}
            disableElevation
            disableFocusRipple
            disableRipple
          >
            Format
          </Button>
          <ButtonGroup variant="contained" size="small" disableElevation disableFocusRipple disableRipple>
            <Button
              color="error"
              onClick={async () => {
                await store.resetRequest();
                store.updateRequestBody(store.getCurrentData().request.body);
              }}
            >
              Reset
            </Button>
            <Button
              color="success"
              onClick={async () => {
                await store.sendRequest();
              }}
            >
              Send
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <Divider />
      <Split direction="vertical" style={{ height: '95%' }} expandToMin={true} gutterSize={5} sizes={[70, 30]}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TabContext value={requestActiveTab}>
            <TabList onChange={handleChange} className="swagger-tab-list" textColor="inherit">
              <Tab label="Schema" value="schema" />
              <Tab label="Request Body" value="body" />
            </TabList>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <TabPanel value="schema" className="swagger-panel">
                <ReactCodeMirror height="100%" value={store.getSchemaString()} basicSetup={{ tabSize: 4 }} theme="dark" extensions={[json5(), EditorView.lineWrapping]} readOnly />
              </TabPanel>
              <TabPanel value="body" className="swagger-panel">
                <ReactCodeMirror
                  value={store.requestBody}
                  basicSetup={{ tabSize: 4 }}
                  theme="dark"
                  extensions={[json5(), EditorView.lineWrapping, linter(json5ParseLinter())]}
                  onChange={(value) => store.updateRequestBody(value)}
                />
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
            {renderDescription(store.getCurrentPathInfo()?.description ?? '')}
          </Typography>
        </div>
      </Split>
    </Card>
  );
});

export default ReqeustSection;
