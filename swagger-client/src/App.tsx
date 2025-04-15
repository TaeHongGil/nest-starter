import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ServerConfig from './common/config/server.config';
import LoadingScreen from './views/others/LoadingScreen';
import Swagger from './views/pages/swagger/Swagger';

const App = () => {
  ServerConfig.init();

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Swagger />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
export default App;
