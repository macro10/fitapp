import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes (matches previous cache TTL)
      gcTime: 30 * 60 * 1000,    // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Default to dark mode unless a preference exists
const savedTheme = localStorage.getItem('theme');
const isDark = savedTheme ? savedTheme === 'dark' : true;
document.documentElement.classList.toggle('dark', isDark);
if (!savedTheme) localStorage.setItem('theme', 'dark');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);