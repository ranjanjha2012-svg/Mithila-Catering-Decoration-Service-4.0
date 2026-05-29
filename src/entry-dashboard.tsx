import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import CurtainLoader from './components/CurtainLoader';
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CurtainLoader />
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 bg-neutral-50min-h-screen pb-12">
        <Dashboard />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  </React.StrictMode>
);
