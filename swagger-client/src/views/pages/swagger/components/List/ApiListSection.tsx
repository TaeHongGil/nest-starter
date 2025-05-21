import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Card, CardContent, Collapse, IconButton, List, ListItemButton, ListSubheader, Typography } from '@mui/material';
import { METHOD_TYPE } from '@root/common/define/common.define';
import { observer } from 'mobx-react';
import { ReactElement, useState } from 'react';
import { HttpStore } from '../../store/HttpStore';
import { protocolStore } from '../../store/ProtocolStore';
import SwaggerMetadata, { PathInfo } from '../../store/SwaggerMetadata';
import { MethodTag } from '../MethodTag';

const ApiPath = ({ method, path, isActive, onClick }: { method: METHOD_TYPE; path: string; isActive: boolean; onClick: () => void }): ReactElement => (
  <ListItemButton onClick={onClick} className={`api-path ${isActive ? 'show' : ''}`}>
    <Typography variant="body2" className={`api-text`} padding={0}>
      <MethodTag method={method} sm />
      {path}
    </Typography>
  </ListItemButton>
);

const ApiCategory = observer(({ category, datas, currentPath, store }: { category: string; datas: PathInfo[]; currentPath: PathInfo; store: HttpStore }) => {
  const [open, setOpen] = useState(datas.some((data) => data.path === currentPath.path && data.method === currentPath.method));

  return (
    <>
      <ListSubheader onClick={() => setOpen(!open)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', paddingRight: '0' }} className="api-groups">
        <Typography variant="body1" style={{ fontWeight: 'bold', flexGrow: 1 }}>
          {category}
        </Typography>
        <IconButton size="small" style={{ marginLeft: 'auto' }}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </ListSubheader>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {datas.map((data, index) => (
          <ApiPath
            key={`${category}-${data.method}-${data.path}-${index}`}
            method={data.method}
            path={data.path}
            isActive={data.path === currentPath.path && data.method === currentPath.method}
            onClick={async () => store.setPathInfo(data)}
          />
        ))}
      </Collapse>
    </>
  );
});

const ApiListSection = observer(() => {
  const httpSotre = protocolStore.httpStore;
  const currentPath = httpSotre.pathInfo;

  return (
    <Card>
      <CardContent style={{ padding: 0, overflowY: 'auto' }}>
        <List>
          {Object.entries(SwaggerMetadata.getApis() ?? {}).map(([category, pathData]) => (
            <ApiCategory key={`${category}`} category={category} datas={pathData} currentPath={currentPath} store={httpSotre} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
});

export default ApiListSection;
