import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider as JotaiProvider } from 'jotai';
import App from './App';
import { darkTheme } from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JotaiProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </JotaiProvider>
  </StrictMode>
);
