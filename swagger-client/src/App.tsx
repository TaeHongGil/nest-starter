import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ServerConfig from './common/config/server.config';
import AppProviders from './components/context/AppProvider';
import LoadingScreen from './views/others/LoadingScreen';
import Swagger from './views/pages/swagger/Swagger';

const App = () => {
  ServerConfig.init();

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <AppProviders>
          <Routes>
            <Route path="/" element={<Swagger />} />
          </Routes>
        </AppProviders>
      </Suspense>
    </BrowserRouter>
  );
};
export default App;
