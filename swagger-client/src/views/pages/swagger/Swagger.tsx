import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
import '@root/css/swagger.css';
import { useLocalObservable } from 'mobx-react';
import { useEffect, useState } from 'react';
import SwaggerBody from './components/SwaggerBody';
import SwaggerHeader from './components/SwaggerHeader';
import { SwaggerStore } from './store/SwaggerStore';

const SwaggerNotFoundScreen = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <Card>
      <CardContent>
        <Typography variant="h3" align="center" margin={5}>
          Not Found Data
        </Typography>
        <Alert severity="info" sx={{ maxWidth: 500, margin: '0 auto' }}>
          1. Run npm run swagger
          <br />
          <br />
          2. Run Server
        </Alert>
      </CardContent>
    </Card>
  </Box>
);

export interface SwaggerProps {
  store: SwaggerStore;
}

const Swagger = () => {
  const store = useLocalObservable(() => new SwaggerStore());
  const [init, setInit] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const initialize = async () => {
      const metadata = await store.loadMetadataAsync();
      if (!metadata?.spec) {
        return;
      }
      await store.init(metadata);
      setInit(true);
    };
    initialize();
  }, []);

  if (!init || !store.metadata || Object.keys(store.metadata).length === 0) {
    return <SwaggerNotFoundScreen />;
  }

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
