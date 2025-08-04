import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { protocolStore } from '../../store/ProtocolStore';
import SwaggerMetadata from '../../store/SwaggerMetadata';

const IGNORED_KEYS = ['type', 'description', '$ref', 'properties', 'items', 'required', 'default', 'allOf'];

function sortQueryBySchema(query: Record<string, any>, schema: any): Record<string, any> {
  return Object.keys(query)
    .sort((a, b) => {
      const indexA = schema?.parameters.findIndex((param: any) => param.name === a) ?? -1;
      const indexB = schema?.parameters.findIndex((param: any) => param.name === b) ?? -1;

      return indexA - indexB;
    })
    .reduce<Record<string, any>>((acc, key) => {
      acc[key] = query[key];

      return acc;
    }, {});
}

function handleInputChange({ name, inType, value, type, httpStore, pathInfo }: { name: string; inType: 'path' | 'query'; value: any; type: string; httpStore: any; pathInfo: any }): void {
  const params = httpStore.requestParams;
  if (inType === 'path') {
    if (!value) {
      delete params.path[name];
    } else {
      params.path[name] = value;
    }
  } else {
    const updatedQuery = { ...httpStore.requestParams };
    if (!value) {
      delete updatedQuery.query[name];
    } else if (type === 'array') {
      updatedQuery.query[name] = value.split(',').map((item: string) => item.trim());
    } else if (type === 'number') {
      updatedQuery.query[name] = Number(value);
    } else {
      updatedQuery.query[name] = value;
    }
    const sortedQuery = sortQueryBySchema(updatedQuery.query, pathInfo);
    params.query = sortedQuery;
  }
  httpStore.setRequestParams(params);
}

function renderTableRows(pathInfo: any, httpStore: any) {
  return pathInfo?.parameters.map((data: any, index: number) => (
    <TableRow key={index}>
      <TableCell>
        {data.name}
        {data.required ? <span style={{ color: 'red' }}>*</span> : ''}
      </TableCell>
      <TableCell>{data.in}</TableCell>
      <TableCell>
        <TextField
          className="query-text-field"
          variant="outlined"
          size="small"
          fullWidth
          placeholder={`Enter value ${data.required ? '(required)' : ''}`}
          value={data.in === 'path' ? (httpStore.requestParams.path[data.name] ?? '') : (httpStore.requestParams.query[data.name] ?? '')}
          type={data.schema.type === 'number' ? 'number' : 'text'}
          onChange={(e) =>
            handleInputChange({
              name: data.name,
              inType: data.in,
              value: e.target.value,
              type: data.schema.type,
              httpStore,
              pathInfo,
            })
          }
        />
      </TableCell>
      <TableCell>{data.schema.type}</TableCell>
      <TableCell>{data.description}</TableCell>
      <TableCell>
        {Object.entries(data.schema)
          .filter(([key]) => !IGNORED_KEYS.includes(key))
          .map(([key, value]) => (
            <div key={key}>{`${key}: ${value}`}</div>
          ))}
      </TableCell>
    </TableRow>
  ));
}

const QueryTable = observer(() => {
  const httpStore = protocolStore.httpStore;
  const pathInfo = SwaggerMetadata.getPath(httpStore.pathInfo.method, httpStore.pathInfo.path);

  return (
    <TableContainer className="request-table-container">
      <TextField
        label={'URL PREVIEW'}
        variant="filled"
        multiline
        minRows={3}
        maxRows={3}
        fullWidth
        value={httpStore.previewUrl()}
        slotProps={{
          input: {
            readOnly: true,
          },
        }}
      />
      <Typography variant="subtitle1" marginTop={1}>
        Parameters
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>In</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableRows(pathInfo, httpStore)}</TableBody>
      </Table>
    </TableContainer>
  );
});

export default QueryTable;
