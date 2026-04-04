import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import CurtainLoader from './components/CurtainLoader';
import Services from './components/Services';
import Gallery from './components/Gallery';
import AIPlanner from './components/AIPlanner';
import EnquiryForm from './components/EnquiryForm';
import WhatsAppButton from './components/WhatsAppButton';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CurtainLoader />
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <AIPlanner />
        <EnquiryForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  </React.StrictMode>
);
