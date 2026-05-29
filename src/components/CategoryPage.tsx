import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, ArrowRight } from 'lucide-react';
import { MenuItem, menuItems } from '../constants/menu';
import Header from './Header';
import Footer from './Footer';
import CurtainLoader from './CurtainLoader';
import { useCart } from '../context/CartContext';
import CateringRoot from './CateringRoot';

interface CategoryPageProps {
  category: string;
  categoryName: string;
}

export default function CategoryPage({ category, categoryName }: CategoryPageProps) {
  return (
    <CateringRoot>
      <CategoryPageContent category={category} categoryName={categoryName} />
    </CateringRoot>
  );
}

function CategoryPageContent({ category, categoryName }: CategoryPageProps) {
  const { addToCart } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'half' | 'full' | 'single'>('single');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'popularity' | 'default'>('default');

  const getPrice = (item: MenuItem) => {
    return item.price || item.halfPrice || 0;
  };

  const filteredItems = menuItems
    .filter(item => item.category === category)
    .sort((a, b) => {
      if (sortBy === 'price-low') return getPrice(a) - getPrice(b);
      if (sortBy === 'price-high') return getPrice(b) - getPrice(a);
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      return 0;
    });

  const handleOrderClick = (item: MenuItem) => {
    if (item.halfPrice && item.fullPrice) {
      setSelectedItem(item);
      setSelectedSize('half');
      setShowSizeModal(true);
    } else {
      addToCart(item, 'single');
      window.dispatchEvent(new CustomEvent('open-mithila-cart'));
    }
  };

  const handleAddWithSelectedSize = () => {
    if (selectedItem) {
      addToCart(selectedItem, selectedSize);
      setShowSizeModal(false);
      window.dispatchEvent(new CustomEvent('open-mithila-cart'));
    }
  };

  return (
    <div className="min-h-screen bg-sky-100">
      <CurtainLoader />
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 relative">
            <motion.a
              href="/order.html"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-0 top-0 hidden md:flex items-center gap-2 text-stone-500 hover:text-orange-600 font-bold transition-colors group"
            >
              <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Menu
            </motion.a>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4"
            >
              <ShoppingCart size={16} />
              {categoryName}
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-4">{categoryName}</h1>
            <p className="text-stone-600 max-w-2xl mx-auto mb-8">
              Freshly prepared {categoryName.toLowerCase()} delivered to your doorstep.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 w-full justify-center mb-2">
                Sort By
              </span>
              <button
                onClick={() => setSortBy('default')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${sortBy === 'default' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
              >
                Default
              </button>
              <button
                onClick={() => setSortBy('price-low')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${sortBy === 'price-low' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
              >
                Price: Low to High
              </button>
              <button
                onClick={() => setSortBy('price-high')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${sortBy === 'price-high' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
              >
                Price: High to Low
              </button>
              <button
                onClick={() => setSortBy('popularity')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${sortBy === 'popularity' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
              >
                Popularity
              </button>
            </div>

            <motion.a
              href="/order.html"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 md:hidden inline-flex items-center gap-2 text-orange-600 font-bold"
            >
              <ArrowRight size={18} className="rotate-180" />
              Back to Menu
            </motion.a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-100 group hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
                    <span className="text-xl font-black text-orange-600">
                      {item.price ? `₹${item.price}${item.unit ? ` / ${item.unit}` : ''}` : `₹${item.halfPrice} / ₹${item.fullPrice}`}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-stone-900 mb-2">{item.name}</h3>
                  <p className="text-stone-500 text-sm mb-6 leading-relaxed">{item.description}</p>
                  <button
                    onClick={() => handleOrderClick(item)}
                    className="w-full py-4 bg-stone-900 text-white font-black rounded-2xl shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    Add to Cart <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Select Portion Size Modal */}
      <AnimatePresence>
        {showSizeModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeModal(false)}
              className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl z-10 border border-orange-50"
            >
              <button 
                onClick={() => setShowSizeModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-stone-50 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-400" />
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-black text-stone-900 mb-1">Select Portion</h3>
                <p className="text-stone-500 text-sm">Portion sizing for <span className="text-orange-600 font-extrabold">{selectedItem.name}</span></p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedSize('half')}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedSize === 'half' 
                        ? 'border-orange-500 bg-orange-50/50 text-orange-950 shadow-sm' 
                        : 'border-neutral-100 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">Half portion</span>
                    <span className="text-xl font-black text-orange-600">₹{selectedItem.halfPrice}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSize('full')}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedSize === 'full' 
                        ? 'border-orange-500 bg-orange-50/50 text-orange-950 shadow-sm' 
                        : 'border-neutral-100 hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">Full portion</span>
                    <span className="text-xl font-black text-orange-600">₹{selectedItem.fullPrice}</span>
                  </button>
                </div>

                <button
                  onClick={handleAddWithSelectedSize}
                  className="w-full py-4 mt-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  Confirm Portions <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
