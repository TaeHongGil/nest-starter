import { observer } from 'mobx-react-lite';
import Split from 'react-split';
import { SwaggerProps } from '../Swagger';
import ApiListSection from './ApiListSection';
import ReqeustSection from './Request/ReqeustSection';
import ResponseSection from './ResponseSection';

const SwaggerBody = observer(({ store }: SwaggerProps) => (
  <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
    <Split key={store.refreshTrigger} className="split" style={{ height: '100%', width: '100%' }} expandToMin={true} gutterSize={5} sizes={[15, 42.5, 42.5]} minSize={[200, 400, 400]}>
      <ApiListSection store={store} />
      <ReqeustSection store={store}></ReqeustSection>
      <ResponseSection store={store}></ResponseSection>
    </Split>
  </div>
));

export default SwaggerBody;
