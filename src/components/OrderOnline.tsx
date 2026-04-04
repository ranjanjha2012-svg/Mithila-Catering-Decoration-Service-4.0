import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { categories } from '../constants/menu';
import Header from './Header';
import Footer from './Footer';
import CurtainLoader from './CurtainLoader';

export default function OrderOnline() {
  return (
    <div className="min-h-screen bg-sky-100">
      <CurtainLoader />
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 relative">
            <motion.a
              href="/"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-0 top-0 hidden md:flex items-center gap-2 text-stone-500 hover:text-orange-600 font-bold transition-colors group"
            >
              <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </motion.a>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4"
            >
              <ShoppingCart size={16} />
              Fresh & Authentic
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-4">Order Online</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Select a category to explore our authentic Mithila menu and place your order.
            </p>

            <motion.a
              href="/"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 md:hidden inline-flex items-center gap-2 text-orange-600 font-bold"
            >
              <ArrowRight size={18} className="rotate-180" />
              Back to Home
            </motion.a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {categories.map((category, i) => (
              <motion.a
                key={category.id}
                href={`/order/${category.slug}.html`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-stone-100 hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    {category.icon}
                  </div>
                </div>
                <div className="p-8 text-center flex flex-col items-center">
                  <h3 className="text-2xl font-black text-stone-900 mb-4">{category.name}</h3>
                  <div className="mt-auto flex items-center gap-2 text-orange-600 font-bold uppercase tracking-widest text-sm">
                    Explore Menu <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
