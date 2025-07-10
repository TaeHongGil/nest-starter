import CircleIcon from '@mui/icons-material/Circle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Card, CardContent, Collapse, IconButton, List, ListItemButton, ListSubheader, Typography } from '@mui/material';
import { observer } from 'mobx-react';
import { ReactElement, useState } from 'react';
import { protocolStore } from '../../store/ProtocolStore';
import SwaggerMetadata, { EventInfo } from '../../store/SwaggerMetadata';

const EventPath = ({ event, isActive, onClick }: { event: string; isActive: boolean; onClick: () => void }): ReactElement => (
  <ListItemButton onClick={onClick} className={`api-path ${isActive ? 'show' : ''}`}>
    <Typography variant="body2" className={`api-text`} sx={{ paddingLeft: 2 }}>
      {event}
    </Typography>
  </ListItemButton>
);

const Namespace = observer(({ namespace, events, currentEvent }: { namespace: string; events: string[]; currentEvent: EventInfo }) => {
  const [open, setOpen] = useState(namespace === currentEvent.namespace);
  const socketStore = protocolStore.socketStore;
  const status = socketStore.connectionStatus[namespace];
  const isConnected = status === 'connected';
  const isReconnecting = status === 'reconnecting';
  const handleConnect = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    await socketStore.connectSocket(namespace);
  };
  const handleDisconnect = (e: React.MouseEvent): void => {
    e.stopPropagation();
    socketStore.disconnectSocket(namespace);
  };

  return (
    <>
      <ListSubheader onClick={() => setOpen(!open)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', paddingRight: '0' }} className="api-groups">
        <Typography variant="body1" style={{ fontWeight: 'bold', flexGrow: 1, display: 'flex', alignItems: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {namespace}
          <CircleIcon sx={{ fontSize: 12, ml: 1, color: isReconnecting ? 'warning.main' : isConnected ? 'success.main' : 'error.main' }} />
          {isReconnecting && <span style={{ color: '#ed6c02', fontSize: 12, marginLeft: 4 }}>{isReconnecting ? 'reconnecting...' : ''}</span>}
        </Typography>
        <Button
          size="small"
          variant="contained"
          color={isConnected ? 'error' : 'success'}
          sx={{ width: 100, boxShadow: 'none', ':hover': { boxShadow: 'none' } }}
          onClick={isConnected ? handleDisconnect : handleConnect}
          disableRipple
          disabled={isReconnecting}
        >
          {isConnected ? 'disconect' : 'conect'}
        </Button>
        <IconButton size="small" style={{ marginLeft: 'auto' }}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </ListSubheader>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {events.map((event, index) => (
          <EventPath
            key={`${namespace}-${event}-${index}`}
            event={event}
            isActive={namespace === currentEvent.namespace && event === currentEvent.event}
            onClick={async () => socketStore.setEventInfo({ namespace, event })}
          />
        ))}
      </Collapse>
    </>
  );
});

const EventListSection = observer(() => {
  const currentEvent = protocolStore.socketStore.eventInfo;

  return (
    <Card>
      <CardContent style={{ padding: 0, overflowY: 'auto' }}>
        <List>
          {Object.entries(SwaggerMetadata.getEvents?.() ?? {}).map(([namespace, events]) => (
            <Namespace key={namespace} namespace={namespace} events={events} currentEvent={currentEvent} />
          ))}
        </List>
      </CardContent>
    </Card>
  );
});

export default EventListSection;
