import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SystemProvider } from './contexts/SystemContext';
import './styles.css';
import './brand-config.css';
import './ui-polish.css';
import './enterprise-enhancements.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SystemProvider>
        <App />
      </SystemProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
