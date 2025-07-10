import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
import ServerConfig from '@root/common/config/server.config';
import { METHOD_TYPE } from '@root/common/define/common.define';
import HttpUtil from '@root/common/util/http.util';
import MessageUtil from '@root/common/util/message.util';
import '@root/css/swagger.css';
import { ReactElement, useEffect, useState } from 'react';
import SwaggerBody from './components/SwaggerBody';
import SwaggerHeader from './components/SwaggerHeader';
import { protocolStore } from './store/ProtocolStore';
import SwaggerMetadata from './store/SwaggerMetadata';

const SwaggerNotFoundScreen = (): ReactElement => (
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

const Swagger = (): ReactElement => {
  const [init, setInit] = useState<boolean | undefined>(undefined);

  const loadMetadataAsync = async (): Promise<any> => {
    try {
      const result = await HttpUtil.request(ServerConfig.url, METHOD_TYPE.GET, `${ServerConfig.server_version}/swagger`);

      return result.data;
    } catch (error: any) {
      console.error('Failed to load metadata:', error);
      MessageUtil.error(error.message);
    }
  };

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      const metadata = await loadMetadataAsync();
      if (!metadata?.spec) {
        return;
      }
      SwaggerMetadata.initialize(metadata);
      setInit(true);
      await protocolStore.initialize();
    };

    initialize();
  }, []);

  if (!init || !SwaggerMetadata || Object.keys(SwaggerMetadata).length === 0) {
    return <SwaggerNotFoundScreen />;
  }

  return (
    <div className="swagger-container">
      <SwaggerHeader />
      <div className="swagger-body">
        <SwaggerBody />
      </div>
    </div>
  );
};

export default Swagger;
