import '@root/css/swagger.css';
import { useLocalObservable } from 'mobx-react';
import { useEffect, useState } from 'react';
import SwaggerBody from './components/SwaggerBody';
import SwaggerHeader from './components/SwaggerHeader';
import { SwaggerStore } from './store/SwaggerStore';

export interface SwaggerProps {
  store: SwaggerStore;
}

const Swagger = () => {
  const store = useLocalObservable(() => new SwaggerStore());
  const [init, setInit] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const initialize = async () => {
      const metadata = await store.loadMetadataAsync();
      await store.init(metadata);
      setInit(true);
    };
    initialize();
  }, []);

  return (
    <div className="swagger-container">
      <SwaggerHeader store={store} />
      <div className="swagger-body">
        <SwaggerBody store={store} />
      </div>
    </div>
  );
};

export default Swagger;
