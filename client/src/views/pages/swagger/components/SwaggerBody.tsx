import { observer } from 'mobx-react-lite';
import Split from 'react-split';
import { protocolStore } from '../store/ProtocolStore';
import ApiListSection from './List/ApiListSection';
import EventListSection from './List/EventListSection';
import ReqeustSection from './Request/ReqeustSection';
import SocketEmitSection from './Request/SocketEmitSection';
import ResponseSection from './Response/ResponseSection';
import SocketLogsSection from './Response/SocketLogsSection';

const SwaggerBody = observer(() => {
  const serverType = protocolStore.server_type;

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
      {serverType == 'api' ? (
        <Split
          key={`api-${protocolStore.httpStore.refreshTrigger}`}
          className="split"
          style={{ height: '100%', width: '100%' }}
          expandToMin={true}
          gutterSize={5}
          sizes={[15, 42.5, 42.5]}
          minSize={[200, 400, 400]}
        >
          <ApiListSection />
          <ReqeustSection />
          <ResponseSection />
        </Split>
      ) : (
        <Split
          key={`socket-${protocolStore.socketStore.refreshTrigger}`}
          className="split"
          style={{ height: '100%', width: '100%' }}
          expandToMin={true}
          gutterSize={5}
          sizes={[15, 42.5, 42.5]}
          minSize={[200, 400, 400]}
        >
          <EventListSection />
          <SocketEmitSection />
          <SocketLogsSection />
        </Split>
      )}
    </div>
  );
});

export default SwaggerBody;
