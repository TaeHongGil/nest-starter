import { Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import CommonUtil from '@root/common/util/common.util';
import { observer } from 'mobx-react';
import React from 'react';
import { SwaggerProps } from '../../Swagger';
import SwaggerMetadata from '../../store/SwaggerMetadata';

const IGNORED_KEYS = ['type', 'description', '$ref', 'properties', 'items', 'required', 'default', 'allOf'];

const SchemaTableContent: React.FC<{ name: string; schema: any; getType: (detail: any, depth?: number) => { type: string; depth: number } }> = ({ name, schema, getType }) => (
  <>
    <Typography variant="subtitle1" fontWeight={'bold'} marginTop={1}>
      {name}
    </Typography>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Required</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Details</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(schema.properties).map(([propName, propDetails]: [string, any]) => {
          const ref = CommonUtil.findAllValuesByKey(propDetails, '$ref').join();
          const childSchemaName = ref ? SwaggerMetadata.getSchemaName(ref) : '';
          const typeInfo = getType(propDetails);
          const type = childSchemaName ? childSchemaName : typeInfo.type;
          const depth = typeInfo.depth;

          return (
            <TableRow key={propName}>
              <TableCell>{propName}</TableCell>
              <TableCell>{schema.required?.includes(propName) || propDetails.required ? 'true' : 'false'}</TableCell>
              <TableCell className={childSchemaName ? 'ref-text' : ''}>{type + '[]'.repeat(depth)}</TableCell>
              <TableCell>{CommonUtil.findAllValuesByKey(propDetails, 'description')}</TableCell>
              <TableCell>
                {Object.entries(propDetails)
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
    <Divider sx={{ marginBottom: 5 }} />
  </>
);

const SchemaTable = observer(({ store }: SwaggerProps) => {
  const currentSchema = store.getCurrentSchmea();
  if (!currentSchema)
    return (
      <Typography variant="subtitle1" padding={2}>
        not found data
      </Typography>
    );
  const { name, schema } = currentSchema;
  const childSchemas = Array.from(new Set(CommonUtil.findAllValuesByKey(schema, '$ref')));

  const getType = (detail: any, depth = 0): { type: string; depth: number } => {
    if (detail?.type === 'array' && detail.items) {
      return getType(detail.items, depth + 1);
    }
    return { type: detail?.type, depth };
  };

  return (
    <>
      <TableContainer className="request-table-container">
        <SchemaTableContent name={name} schema={schema} getType={getType} />
        {childSchemas.map((ref) => {
          const childSchemaName = SwaggerMetadata.getSchemaName(ref);
          const childSchema = store.metadata?.getSchema(childSchemaName);
          if (childSchema) {
            return <SchemaTableContent key={childSchemaName} name={childSchemaName} schema={childSchema} getType={getType} />;
          }
          return null;
        })}
      </TableContainer>
    </>
  );
});

export default SchemaTable;
