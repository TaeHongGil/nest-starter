import { Box, LinearProgress, linearProgressClasses } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ServerConfig from '@root/common/config/server.config';
import managementStore from '@root/views/pages/management/store/ManagementStore';
import { varAlpha } from 'minimal-shared/utils';
import { observer } from 'mobx-react-lite';
import { lazy, ReactElement, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppProviders from './components/context/AppProvider';

const PageServerError = lazy(async () => import('@root/views/pages/management/material-kit/pages/page-server-error'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

const App = observer((): ReactElement => {
  const getRoutes = async () => {
    if (import.meta.env.VITE_BUILD_TYPE === 'swagger') {
      const LazySwagger = lazy(async () => import('./views/pages/swagger/Swagger'));

      return (
        <Routes>
          <Route path="/" element={<LazySwagger />} />
        </Routes>
      );
    } else if (import.meta.env.VITE_BUILD_TYPE === 'management') {
      const { routesSection } = await import('@root/views/pages/management/material-kit/routes/sections');

      return (
        <GoogleOAuthProvider clientId={managementStore.platformInfo?.google?.client_id || ''}>
          <Routes>
            {managementStore.platformInfo ? (
              routesSection.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} caseSensitive={route.caseSensitive}>
                  {route.children?.map((child, childIndex) => (
                    <Route key={childIndex} path={child.path} element={child.element} caseSensitive={child.caseSensitive} />
                  ))}
                </Route>
              ))
            ) : (
              <Route path="*" element={<PageServerError />} />
            )}
          </Routes>
        </GoogleOAuthProvider>
      );
    }
  };

  return (
    <BrowserRouter basename={`/client/${ServerConfig.build_type}`}>
      <Suspense fallback={renderFallback()}>
        <AppProviders>{getRoutes()}</AppProviders>
      </Suspense>
    </BrowserRouter>
  );
});

export default App;
