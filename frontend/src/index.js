import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Default to dark mode unless a preference exists
const savedTheme = localStorage.getItem('theme');
const isDark = savedTheme ? savedTheme === 'dark' : true;
document.documentElement.classList.toggle('dark', isDark);
if (!savedTheme) localStorage.setItem('theme', 'dark');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);