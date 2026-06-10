import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SystemProvider } from './contexts/SystemContext';
import './styles.css';
import './brand-config.css'; // تنظیمات مستقل لوگوها — فقط این فایل را ویرایش کن

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SystemProvider>
        <App />
      </SystemProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
