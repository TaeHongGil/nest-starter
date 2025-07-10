import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import HttpUtil from '@root/common/util/http.util';
import { observer } from 'mobx-react';
import { protocolStore } from '../../store/ProtocolStore';
import SwaggerMetadata from '../../store/SwaggerMetadata';

const IGNORED_KEYS = ['type', 'description', '$ref', 'properties', 'items', 'required', 'default', 'allOf'];

const QueryTable = observer(() => {
  const httpStore = protocolStore.httpStore;
  const pathInfo = SwaggerMetadata.getPath(httpStore.pathInfo.method, httpStore.pathInfo.path);

  const sortQueryBySchema = (query: Record<string, any>, schema: any): Record<string, any> =>
    Object.keys(query)
      .sort((a, b) => {
        const indexA = schema?.parameters.findIndex((param: any) => param.name === a) ?? -1;
        const indexB = schema?.parameters.findIndex((param: any) => param.name === b) ?? -1;

        return indexA - indexB;
      })
      .reduce<Record<string, any>>((acc, key) => {
        acc[key] = query[key];

        return acc;
      }, {});

  const handleInputChange = (name: string, value: any, type: string): void => {
    const updatedQuery = { ...httpStore.requestQuery };
    if (!value) {
      delete updatedQuery[name];
    } else if (type === 'array') {
      updatedQuery[name] = value.split(',').map((item: string) => item.trim());
    } else {
      updatedQuery[name] = value;
    }

    const sortedQuery = sortQueryBySchema(updatedQuery, pathInfo);
    httpStore.setRequestQuery(sortedQuery);
  };

  return (
    <TableContainer className="request-table-container">
      <TextField
        label={'URL PREVIEW'}
        variant="filled"
        multiline
        minRows={3}
        maxRows={3}
        fullWidth
        value={HttpUtil.previewUrl(httpStore.pathInfo.path, httpStore.requestQuery)}
        slotProps={{
          input: {
            readOnly: true,
          },
        }}
      />
      <Typography variant="subtitle1" marginTop={1}>
        Query Parameters
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pathInfo?.parameters.map((data: any) => {
            if (data.in !== 'query') return null;

            return (
              <TableRow key={data.name}>
                <TableCell>
                  {data.name}
                  {data.required ? <span style={{ color: 'red' }}>*</span> : ''}
                </TableCell>
                <TableCell>
                  <TextField
                    className="query-text-field"
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder={`Enter value ${data.required ? '(required)' : ''}`}
                    value={httpStore.requestQuery[data.name] || ''}
                    type={data.schema.type === 'number' ? 'number' : 'text'}
                    onChange={(e) => handleInputChange(data.name, e.target.value, data.schema.type)}
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default QueryTable;
