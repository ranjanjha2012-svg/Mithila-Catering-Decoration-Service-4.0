import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ArrowRight, Search, Sparkles, AlertCircle, RefreshCw, X, Loader2 } from 'lucide-react';
import { categories, MenuItem, menuItems } from '../constants/menu';
import Header from './Header';
import Footer from './Footer';
import CurtainLoader from './CurtainLoader';
import { useCart } from '../context/CartContext';
import { auth } from '../lib/firebase';
import CateringRoot from './CateringRoot';

// Fuzzy Spelling & Synonym AI match dictionary
function fuzzyAiMatch(query: string): { correctedText: string; results: MenuItem[] } {
  const normQuery = query.toLowerCase().trim();
  
  const dictionary: { [key: string]: string } = {
    'paner': 'paneer',
    'pneer': 'paneer',
    'pannier': 'paneer',
    'panir': 'paneer',
    'paniri': 'paneer',
    'shahi pan': 'paneer',
    'butt paneer': 'paneer butter masala',
    'chiken': 'chicken',
    'chikan': 'chicken',
    'chickn': 'chicken',
    'ciken': 'chicken',
    'chicen': 'chicken',
    'buter chiken': 'butter chicken',
    'mton': 'mutton',
    'muton': 'mutton',
    'moton': 'mutton',
    'maton': 'mutton',
    'keema': 'keema',
    'chusta': 'chusta',
    'fsh': 'fish',
    'fsh curry': 'fish',
    'mach': 'fish',
    'maach': 'fish',
    'eg': 'egg',
    'eg curry': 'egg curry',
    'roti': 'roti',
    'roty': 'roti',
    'parata': 'paratha',
    'paratha': 'paratha',
    'puri': 'puri',
    'poori': 'puri',
    'nan': 'naan',
    'nan butter': 'butter naan',
    'rice': 'rice',
    'ric': 'rice',
    'pulao': 'pulao',
    'pulav': 'pulao',
    'biryani': 'biryani',
    'biryani family': 'biryani',
    'briyani': 'biryani',
    'samosa': 'samosa',
    'momos': 'momos',
    'momo': 'momos',
    'chowmin': 'chowmin',
    'chomin': 'chowmin',
    'noodles': 'chowmin',
    'thali': 'thali',
    'sweets': 'sweets',
    'sweet': 'sweets',
    'mithila': 'mithila',
    'litti': 'litti',
  };

  let matchedKeyword = '';
  for (const key in dictionary) {
    if (normQuery.includes(key) || key.includes(normQuery)) {
      matchedKeyword = dictionary[key];
      break;
    }
  }

  if (!matchedKeyword) {
    const keywords = ['paneer', 'chicken', 'mutton', 'fish', 'egg', 'roti', 'paratha', 'rice', 'biryani', 'chowmin', 'momos', 'samosa', 'thali', 'sweets', 'litti', 'dal'];
    for (const kw of keywords) {
      let matchingChars = 0;
      const kwChars = kw.split('');
      for (const char of normQuery.split('')) {
        const charIdx = kwChars.indexOf(char);
        if (charIdx > -1) {
          matchingChars++;
          kwChars.splice(charIdx, 1);
        }
      }
      const similarity = matchingChars / Math.max(kw.length, normQuery.length);
      if (similarity >= 0.55) {
        matchedKeyword = kw;
        break;
      }
    }
  }

  const keywordToUse = matchedKeyword || normQuery;
  const filtered = menuItems.filter(item => {
    return (
      item.name.toLowerCase().includes(keywordToUse) ||
      item.description.toLowerCase().includes(keywordToUse) ||
      item.category.toLowerCase().includes(keywordToUse)
    );
  });

  return {
    correctedText: matchedKeyword ? matchedKeyword.toUpperCase() : query.toUpperCase(),
    results: filtered
  };
}

export default function OrderOnline() {
  return (
    <CateringRoot>
      <OrderOnlineContent />
    </CateringRoot>
  );
}

function OrderOnlineContent() {
  const { addToCart } = useCart();
  const [searchQueryParam, setSearchQueryParam] = useState('');
  const [normalResults, setNormalResults] = useState<MenuItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Portions selection
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'half' | 'full' | 'single'>('single');
  const [showSizeModal, setShowSizeModal] = useState(false);

  // Sync state with URL Search query
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search') || '';
      setSearchQueryParam(q);

      if (q) {
        setHasSearched(true);
        // Find normal matching items
        let matched = menuItems.filter(item => 
          item.name.toLowerCase().includes(q.toLowerCase()) ||
          item.description.toLowerCase().includes(q.toLowerCase()) ||
          item.category.toLowerCase().includes(q.toLowerCase())
        );

        if (matched.length === 0) {
          // Instantly fallback to our spelling/synonym dictionary results to be helpful
          const { results } = fuzzyAiMatch(q);
          matched = results;
        }

        setNormalResults(matched);
      } else {
        setHasSearched(false);
        setNormalResults([]);
      }
    };

    handleLocationChange();
    // Watch for URL push state adjustments
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [window.location.search]);

  const handleClearSearch = () => {
    window.history.pushState(null, '', '/order.html');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleOrderClick = (item: MenuItem) => {
    if (!auth.currentUser) {
      window.dispatchEvent(new CustomEvent('open-mithila-auth'));
      return;
    }
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
    if (!auth.currentUser) {
      window.dispatchEvent(new CustomEvent('open-mithila-auth'));
      return;
    }
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
      
      <main className="pt-36 lg:pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header section */}
          <div className="text-center mb-12 relative select-none">
            <motion.a
              href="/"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-0 top-0 hidden md:flex items-center gap-2 text-stone-600 hover:text-orange-600 font-bold transition-colors group"
            >
              <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </motion.a>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-wider mb-4"
            >
              <ShoppingCart size={15} />
              Fresh &amp; Authentic Traditional Food
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-3 tracking-tight">
              {hasSearched ? `Search Results for "${searchQueryParam}"` : "Order Online"}
            </h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-xs sm:text-sm font-bold leading-relaxed uppercase tracking-wider">
              {hasSearched 
                ? "Looking through our traditional Mithila kitchen delicacies and recipe catalogs." 
                : "Select a category to explore our authentic Mithila menu and place your order."}
            </p>

            {hasSearched && (
              <button 
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-stone-900 hover:bg-orange-600 text-white text-xs font-extrabold uppercase tracking-widest rounded-full transition-colors inline-flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <X size={14} /> View All Categories / Reset
              </button>
            )}
          </div>

          {/* Core Content Flow */}
          <AnimatePresence mode="wait">
            {!hasSearched ? (
              /* Display standard Categories list */
              <motion.div 
                key="categories"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
              >
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
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-lg leading-none">
                        {category.icon}
                      </div>
                    </div>
                    <div className="p-8 text-center flex flex-col items-center flex-grow justify-between">
                      <h3 className="text-xl font-black text-rose-950 mb-4">{category.name}</h3>
                      <div className="mt-auto flex items-center gap-2 text-orange-600 font-bold uppercase tracking-widest text-xs">
                        Explore Menu <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            ) : (
              /* Display Search Content Panel */
              <motion.div 
                key="search-listing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-6xl mx-auto"
              >
                {normalResults.length > 0 ? (
                  <div>
                    <div className="text-stone-800 text-xs font-black uppercase tracking-wider pb-6 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                      Loaded {normalResults.length} matching {normalResults.length === 1 ? 'item' : 'items'}:
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {normalResults.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-orange-100 group hover:shadow-2xl hover:border-orange-200 transition-all duration-500 flex flex-col justify-between"
                        >
                          <div className="relative h-56 overflow-hidden">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border border-orange-50">
                              <span className="text-sm font-black text-orange-600">
                                {item.price ? `₹${item.price}${item.unit ? ` / ${item.unit}` : ''}` : `₹${item.halfPrice} / ₹${item.fullPrice}`}
                              </span>
                            </div>
                          </div>
                          <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="text-lg md:text-xl font-black text-rose-955 mb-2">{item.name}</h3>
                              <p className="text-stone-500 text-xs leading-relaxed mb-6">{item.description}</p>
                            </div>
                            <button
                              onClick={() => handleOrderClick(item)}
                              className="w-full py-3.5 bg-stone-900 text-white font-black rounded-xl shadow-md hover:bg-orange-600 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                              Add to Cart <ArrowRight size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-10 md:p-14 text-center border-2 border-red-100 shadow-xl max-w-xl mx-auto pb-12 select-none">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-black text-rose-955 mb-2">No Match Possible</h3>
                    <p className="text-stone-500 text-xs md:text-sm leading-relaxed mb-6 font-semibold">
                      We couldn't find any dish named <span className="text-red-600 font-extrabold">"{searchQueryParam}"</span> on our menu list.
                    </p>
                    <div className="space-y-4 pt-4 border-t border-neutral-100">
                      <button 
                        onClick={handleClearSearch}
                        className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95 mx-auto block"
                      >
                        Explore Categories Menu
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
              className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl z-10 border border-orange-50 text-left"
            >
              <button 
                onClick={() => setShowSizeModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-stone-50 rounded-full transition-colors"
                aria-label="Close"
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
