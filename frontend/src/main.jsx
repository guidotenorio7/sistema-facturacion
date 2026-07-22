import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { SessionProvider } from './components/Session.jsx';
import { SnackbarProvider } from './components/Snackbar.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </SessionProvider>
  </StrictMode>,
);
