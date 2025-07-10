import { linter } from '@codemirror/lint';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Button, ButtonGroup, Card, Divider, Tab, Typography } from '@mui/material';
import { METHOD_TYPE } from '@root/common/define/common.define';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import { json5, json5ParseLinter } from 'codemirror-json5';
import { observer } from 'mobx-react';
import { ReactElement, useState } from 'react';
import Split from 'react-split';
import { protocolStore } from '../../store/ProtocolStore';
import SwaggerMetadata from '../../store/SwaggerMetadata';
import { MethodTag } from '../MethodTag';
import SchemaTable from '../SchemaTable';
import QueryTable from './QueryTable';

const ReqeustSection = observer(() => {
  const [requestActiveTab, setRequestActiveTab] = useState<string>('1');
  const httpSotre = protocolStore.httpStore;
  const path = httpSotre.pathInfo.path;
  const method = httpSotre.pathInfo.method;
  const isGet = method === METHOD_TYPE.GET;
  const requestSchema = httpSotre.getRequestSchema();

  const handleChange = (event: React.SyntheticEvent, tab: string): void => {
    setRequestActiveTab(tab);
  };

  const renderDescription = (description: string): React.ReactNode => {
    const urlRegex = /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$\-@.&+:/?_#]|[!*(),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/g;
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
                httpSotre.setRequestBody(SwaggerMetadata.formatJson(httpSotre.requestBody, requestSchema?.schema));
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
                await httpSotre.resetRequest();
              }}
            >
              Reset
            </Button>
            <Button
              color="success"
              onClick={async () => {
                await httpSotre.sendRequest();
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
              <TabPanel value="0" classes={{ root: 'swagger-panel' }}>
                {isGet ? (
                  <Typography variant="subtitle1" padding={2}>
                    not found data
                  </Typography>
                ) : (
                  ((): ReactElement => <SchemaTable name={requestSchema?.name ?? ''} schema={requestSchema?.schema} />)()
                )}
              </TabPanel>
              {isGet ? (
                <TabPanel value="1" classes={{ root: 'swagger-panel' }}>
                  <QueryTable />
                </TabPanel>
              ) : (
                <TabPanel value="1" classes={{ root: 'swagger-panel cusror-text' }}>
                  <ReactCodeMirror value={httpSotre.requestBody} extensions={[json5(), EditorView.lineWrapping, linter(json5ParseLinter())]} onChange={(value) => httpSotre.setRequestBody(value)} />
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
            {renderDescription(SwaggerMetadata.getPath(method, path)?.description ?? '')}
          </Typography>
        </div>
      </Split>
    </Card>
  );
});

export default ReqeustSection;
