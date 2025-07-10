import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@root/views/pages/management/material-kit/theme';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement as HTMLElement);

root.render(
  <ThemeProvider>
    <CssBaseline />
    <App />
  </ThemeProvider>,
);
