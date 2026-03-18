import React from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './components/Layout';
import AIPlanner from './components/AIPlanner';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Layout>
      <div className="pt-20">
        <AIPlanner />
      </div>
    </Layout>
  </React.StrictMode>
);
