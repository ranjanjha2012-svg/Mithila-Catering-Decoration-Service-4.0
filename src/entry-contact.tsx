import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './components/Layout';
import EnquiryForm from './components/EnquiryForm';
import GoogleMap from './components/GoogleMap';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Layout>
      <div className="pt-20">
        <EnquiryForm />
        <GoogleMap />
      </div>
    </Layout>
  </React.StrictMode>
);
