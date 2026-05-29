import React from 'react';
import ReactDOM from 'react-dom/client';
import CareersPage from './components/CareersPage';
import CateringRoot from './components/CateringRoot';
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CateringRoot>
      <CareersPage />
      <WhatsAppButton />
    </CateringRoot>
  </React.StrictMode>
);
