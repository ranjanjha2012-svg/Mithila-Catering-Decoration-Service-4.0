/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Services from './components/Services';
import Gallery from './components/Gallery';
import AIPlanner from './components/AIPlanner';
import EnquiryForm from './components/EnquiryForm';
import GoogleMap from './components/GoogleMap';
import TiffinService from './components/TiffinService';

function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Gallery />
      <AIPlanner />
      <EnquiryForm />
      <GoogleMap />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tiffin-service" element={<TiffinService />} />
          {/* Fallback for other routes */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
