import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Search, X, ChevronRight, ArrowUpRight, HelpCircle } from 'lucide-react';
import { menuItems, MenuItem } from '../constants/menu';

export default function AiSearchFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MenuItem[]>([]);
  const windowRef = useRef<HTMLDivElement>(null);

  // Quick Suggestion triggers
  const suggestions = ['Special Thali', 'Butter Chicken', 'Litti Chokha', 'Sweets', 'Fish Curry', 'Paneer'];

  // Advanced clientside fuzzy search and typo corrections
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const cleanQuery = query.toLowerCase().trim();

    // 1. Synonym & basic translation lookup
    const synonyms: { [key: string]: string } = {
      'paner': 'paneer',
      'pneer': 'paneer',
      'paratha': 'paratha',
      'chiken': 'chicken',
      'chikan': 'chicken',
      'mton': 'mutton',
      'maton': 'mutton',
      'fsh': 'fish',
      'mach': 'fish',
      'maach': 'fish',
      'sweet': 'sweets',
      'mitla': 'mithila',
      'rice': 'rice',
      'chokha': 'litti',
      'dal': 'dal',
    };

    let mappedKeyword = cleanQuery;
    for (const key in synonyms) {
      if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
        mappedKeyword = synonyms[key];
        break;
      }
    }

    // 2. Perform matches on menu items
    const matches = menuItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(mappedKeyword);
      const descMatch = item.description.toLowerCase().includes(mappedKeyword);
      const catMatch = item.category.toLowerCase().includes(mappedKeyword);
      return nameMatch || descMatch || catMatch;
    });

    // 3. Fallback to raw query if synonym returns nothing
    if (matches.length > 0) {
      setResults(matches.slice(0, 5));
    } else {
      const rawMatches = menuItems.filter(item => {
        return item.name.toLowerCase().includes(cleanQuery) || 
               item.description.toLowerCase().includes(cleanQuery);
      });
      setResults(rawMatches.slice(0, 5));
    }
  }, [query]);

  // Click outside detection to handle close nicely
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (windowRef.current && !windowRef.current.contains(event.target as Node)) {
        // Only close if it didn't click the floating trigger itself
        const trigger = document.getElementById('ai-search-floating-trigger');
        if (trigger && !trigger.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectItem = (item: MenuItem) => {
    setIsOpen(false);
    // Redirect to order page with specific query
    window.location.href = `/order.html?search=${encodeURIComponent(item.name.trim())}`;
  };

  return (
    <>
      {/* Floating Action Button on Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.button
          id="ai-search-floating-trigger"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white p-3.5 md:p-4 rounded-full shadow-2xl flex items-center gap-2 group border border-white/20 cursor-pointer animate-none relative"
          style={{ boxShadow: '0 10px 25px -5px rgba(185, 28, 28, 0.4)' }}
        >
          {/* Animated pulsing outer ring for discovery */}
          <span className="absolute -inset-1 rounded-full bg-amber-500/30 animate-ping -z-10 opacity-75"></span>
          
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
          <span className="text-xs md:text-sm font-black tracking-wider uppercase select-none">
            {isOpen ? 'Close AI Search' : 'Ask AI Food Finder'}
          </span>
        </motion.button>
      </div>

      {/* Floating Assistance Window popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={windowRef}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            className="fixed bottom-24 left-6 w-[90vw] sm:w-[420px] bg-white border border-stone-200 shadow-2xl rounded-3xl z-50 overflow-hidden flex flex-col"
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: 'min(520px, 80vh)'
            }}
          >
            {/* Elegant Header */}
            <div className="bg-gradient-to-r from-[#e0f7fa] to-cyan-50/50 p-4 border-b border-cyan-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-red-100 text-red-700 rounded-xl flex items-center justify-center font-bold">
                  ✨
                </div>
                <div>
                  <h3 className="text-xs font-black text-rose-950 uppercase tracking-widest leading-none">Mithila AI Assistant</h3>
                  <p className="text-[10px] text-cyan-800 font-bold mt-1">Smart food &amp; spelling searching solver</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-stone-100/80 rounded-lg text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Input Container */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type food name (e.g., muton, chickn, sweet)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-xs font-bold text-stone-800 rounded-2xl border border-stone-200 focus:border-red-500 outline-none transition-colors shadow-inner placeholder:text-stone-400"
                  autoFocus
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              </div>

              {/* Suggestions quick tabs */}
              <div className="mt-3">
                <p className="text-[9px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Try searching for:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => setQuery(sug)}
                      className="px-2.5 py-1 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-stone-200 rounded-full text-[10px] font-semibold text-stone-600 transition-all cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Output Listing */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[180px] max-h-[280px]">
              {query.trim().length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <span className="text-3xl mb-2 select-none">🍛</span>
                  <p className="text-xs font-bold text-stone-700">What are you craving today?</p>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-[240px] leading-relaxed">
                    Type list ingredients or item spelling above to find authentic dishes instantly!
                  </p>
                </div>
              ) : results.length > 0 ? (
                <>
                  <p className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Matched Gourmet Dishes ({results.length}):</p>
                  <div className="space-y-2">
                    {results.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="w-full text-left p-2 hover:bg-orange-50/65 border border-stone-100 rounded-2xl flex gap-3 transition-colors group cursor-pointer"
                      >
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-100 group-hover:scale-102 transition-transform" 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-black text-rose-950 truncate">{item.name}</h4>
                            <span className="text-[10px] font-black text-rose-700 shrink-0">
                              {item.price ? `₹${item.price}` : `₹${item.halfPrice}/Full`}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-stone-500 font-semibold truncate leading-none mt-1">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-1 text-[8.5px] font-black uppercase text-red-600 mt-1">
                            <span>Check detail &amp; Order</span>
                            <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-2 text-stone-400">
                    <HelpCircle size={20} />
                  </div>
                  <p className="text-xs font-bold text-stone-600">No spelling match found</p>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-[240px] mx-auto">
                    Try searching with simpler letters or check our full digital menu!
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
              <a 
                href="/order.html" 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black tracking-widest uppercase text-red-700 hover:text-red-800 transition-colors inline-flex items-center gap-1"
              >
                Explore Entire Menu Category <ChevronRight size={12} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
