import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import TiffinService from './components/TiffinService';
import CurtainLoader from './components/CurtainLoader';
import CateringRoot from './components/CateringRoot';
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CateringRoot>
      <CurtainLoader />
      <div className="min-h-screen">
        <Header />
        <main className="pt-36 lg:pt-32">
          <TiffinService />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </CateringRoot>
  </React.StrictMode>
);
