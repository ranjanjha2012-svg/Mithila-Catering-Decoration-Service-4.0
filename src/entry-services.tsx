import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './components/Layout';
import Services from './components/Services';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Layout>
      <div className="pt-20">
        <Services />
      </div>
    </Layout>
  </React.StrictMode>
);
