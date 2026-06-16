import React from 'react';
import ReactDOM from 'react-dom/client';
import OrderOnline from './components/OrderOnline';
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OrderOnline />
    <WhatsAppButton />
  </React.StrictMode>
);
