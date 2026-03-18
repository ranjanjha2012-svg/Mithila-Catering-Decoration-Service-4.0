/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Services from './components/Services';
import Gallery from './components/Gallery';
import AIPlanner from './components/AIPlanner';
import EnquiryForm from './components/EnquiryForm';
import GoogleMap from './components/GoogleMap';

export default function App() {
  return (
    <Layout>
      <Hero />
      <Services />
      <Gallery />
      <AIPlanner />
      <EnquiryForm />
      <GoogleMap />
    </Layout>
  );
}
