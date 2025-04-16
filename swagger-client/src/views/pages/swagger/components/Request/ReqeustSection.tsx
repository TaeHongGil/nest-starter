import { linter } from '@codemirror/lint';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Button, ButtonGroup, Card, Divider, Tab, Typography } from '@mui/material';
import { METHOD_TYPE } from '@root/common/define/common.define';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json5, json5ParseLinter } from 'codemirror-json5';
import { observer } from 'mobx-react';
import { useState } from 'react';
import Split from 'react-split';
import { SwaggerProps } from '../../Swagger';
import { MethodTag } from '../MethodTag';
import QueryTable from './QueryTable';
import SchemaTable from './SchemaTable';

const ReqeustSection = observer(({ store }: SwaggerProps) => {
  const [requestActiveTab, setRequestActiveTab] = useState<string>('1');
  const path = store.pathData.path;
  const method = store.pathData.method;
  const isGet = method === METHOD_TYPE.GET;

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
          <MethodTag method={method} />
          <span>{path}</span>
        </div>
        <div>
          {!isGet && (
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
          )}
          <ButtonGroup variant="contained" size="small" disableElevation disableFocusRipple disableRipple>
            <Button
              color="error"
              onClick={async () => {
                await store.resetRequest();
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
            <TabList onChange={handleChange} textColor="inherit">
              <Tab label="Schema" value="0" />
              {isGet ? <Tab label="Query" value="1" /> : <Tab label="Request Body" value="1" />}
            </TabList>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <TabPanel value="0" className="swagger-panel">
                {isGet ? (
                  <Typography variant="subtitle1" padding={2}>
                    not found data
                  </Typography>
                ) : (
                  <SchemaTable store={store} />
                )}
              </TabPanel>
              {isGet ? (
                <TabPanel value="1" className="swagger-panel">
                  <QueryTable store={store} />
                </TabPanel>
              ) : (
                <TabPanel value="1" className="swagger-panel cusror-text">
                  <ReactCodeMirror value={store.requestBody} extensions={[json5(), EditorView.lineWrapping, linter(json5ParseLinter())]} onChange={(value) => store.updateRequestBody(value)} />
                </TabPanel>
              )}
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
