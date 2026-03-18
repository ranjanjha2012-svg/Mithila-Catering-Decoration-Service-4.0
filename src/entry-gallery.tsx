import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './components/Layout';
import Gallery from './components/Gallery';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Layout>
      <div className="pt-20">
        <Gallery />
      </div>
    </Layout>
  </React.StrictMode>
);
