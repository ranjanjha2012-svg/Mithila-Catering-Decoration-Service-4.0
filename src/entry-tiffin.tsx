import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import TiffinService from './components/TiffinService';
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <TiffinService />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  </React.StrictMode>
);
