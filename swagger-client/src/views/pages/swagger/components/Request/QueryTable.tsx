import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import HttpUtil from '@root/common/util/http.util';
import { observer } from 'mobx-react';
import { SwaggerProps } from '../../Swagger';

const QueryTable = observer(({ store }: SwaggerProps) => {
  const schmea = store.getCurrentPathInfo();

  const sortQueryBySchema = (query: Record<string, any>, schema: any): Record<string, any> =>
    Object.keys(query)
      .sort((a, b) => {
        const indexA = schema?.parameters.findIndex((param: any) => param.name === a) ?? -1;
        const indexB = schema?.parameters.findIndex((param: any) => param.name === b) ?? -1;
        return indexA - indexB;
      })
      .reduce(
        (acc, key) => {
          acc[key] = query[key];
          return acc;
        },
        {} as Record<string, any>
      );

  const handleInputChange = (name: string, value: any, type: string) => {
    const updatedQuery = { ...store.requestQuery };
    if (!value) {
      delete updatedQuery[name];
    } else if (type === 'array') {
      updatedQuery[name] = value.split(',').map((item: string) => item.trim());
    } else {
      updatedQuery[name] = value;
    }

    const sortedQuery = sortQueryBySchema(updatedQuery, schmea);
    store.updateRequestQuery(sortedQuery);
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
        value={HttpUtil.previewUrl(store.pathData.path, store.requestQuery)}
        slotProps={{
          input: {
            readOnly: true,
          },
        }}
      />
      <Typography color="white" variant="subtitle1" marginTop={1}>
        Query Parameters
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schmea?.parameters.map((data: any) => {
            if (data.in !== 'query') return null;
            return (
              <TableRow key={data.name}>
                <TableCell>{data.name}</TableCell>
                <TableCell>
                  <TextField
                    className="query-text-field"
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter value"
                    value={store.requestQuery[data.name] || ''}
                    type={data.schema.type === 'number' ? 'number' : 'text'}
                    onChange={(e) => handleInputChange(data.name, e.target.value, data.schema.type)}
                  />
                </TableCell>
                <TableCell>{data.schema.type}</TableCell>
                <TableCell>{data.description}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default QueryTable;
