import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import OrderOnline from './components/OrderOnline';
import CurtainLoader from './components/CurtainLoader';
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CurtainLoader />
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <OrderOnline />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  </React.StrictMode>
);
