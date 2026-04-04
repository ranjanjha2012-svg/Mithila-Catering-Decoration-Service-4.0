import React from 'react';
import ReactDOM from 'react-dom/client';
import CategoryPage from './components/CategoryPage';
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CategoryPage category="sweets" categoryName="Sweet Items" />
    <WhatsAppButton />
  </React.StrictMode>
);
