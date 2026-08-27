import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { QueueProvider } from './context/QueueContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '776457487628-867sukk5uhkgb1bv2jahl6eb2edgqa8h.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <UIProvider>
              <QueueProvider>
                <App />
              </QueueProvider>
            </UIProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
