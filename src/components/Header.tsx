import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, MapPin, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import AuthModal from './AuthModal';
import { menuItems } from '../constants/menu';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('search') || '';
    }
    return '';
  });
  const [suggestions, setSuggestions] = useState<typeof menuItems>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const cleanQuery = searchQuery.toLowerCase().trim();
    const matches = menuItems.filter(item => 
      item.name.toLowerCase().includes(cleanQuery)
    ).slice(0, 6);
    setSuggestions(matches);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Redirect to Order page with the query encoded in URLs
    window.location.href = `/order.html?search=${encodeURIComponent(searchQuery.trim())}`;
  };

  const updateCartCount = () => {
    const savedCart = localStorage.getItem('mithila_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const count = parsed.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0);
        setCartCount(count);
      } catch (e) {
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    // Sync cart count
    updateCartCount();
    window.addEventListener('mithila_cart_updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Direct session validation: accept authenticated users
      if (currentUser) {
        setUser(currentUser);
        let savedRole = localStorage.getItem('userRole');
        if (currentUser.email === 'mithilacateringservices@gmail.com') {
          savedRole = 'admin';
          localStorage.setItem('userRole', 'admin');
        }
        if (!savedRole) {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              savedRole = userSnap.data().role || 'customer';
              localStorage.setItem('userRole', savedRole);
            } else {
              savedRole = 'customer';
            }
          } catch (e) {
            console.error("Error fetching user role inside Header:", e);
            savedRole = 'customer';
          }
        }
        setRole(savedRole);

        // Strict Admin Redirection away from customer facing views
        if (savedRole === 'admin') {
          const path = window.location.pathname;
          if (!path.includes('admin-dashboard') && !path.includes('dashboard')) {
            window.location.href = '/admin-dashboard';
          }
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      window.removeEventListener('mithila_cart_updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      window.location.href = '/';
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const triggerCartOpen = () => {
    window.dispatchEvent(new CustomEvent('open-mithila-cart'));
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Tiffin Service', href: '/tiffin.html' },
    { name: 'Order Online', href: '/order.html' },
    { name: 'Event Gallery & Schemes', href: '/gallery.html' },
    { name: 'AI Planner', href: '/planner.html' },
    { name: 'Contact Us', href: '/contact.html' },
  ];

  const displayNavItems = user ? [...navItems, { name: 'My Profile', href: '/profile.html' }] : navItems;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-40 border-b border-orange-100 shadow-sm">
      {/* Welcome Running Marquee - integrated to avoid overlapping */}
      <div className="w-full bg-orange-600 py-1.5 overflow-hidden border-b border-orange-500/20">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-8">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-4">
              ✨ Welcome to Mithila Catering &amp; Decoration Service ✨
            </span>
          ))}
        </div>
      </div>
      <div className="container mx-auto px-4 py-3 flex flex-wrap lg:flex-nowrap justify-between items-center gap-3">
        <a href="/" className="flex items-center gap-3 shrink-0">
          <img 
            src="https://i.ibb.co/Y4fS5FDr/file-000000003bec71faa9b37e16b055cb49.png" 
            alt="Mithila Catering Logo" 
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
          />
          <div>
            <h1 className="text-sm sm:text-lg font-black text-red-800 leading-tight">Mithila Catering &</h1>
            <p className="text-[9px] sm:text-xs font-bold text-orange-600 uppercase tracking-widest leading-none mt-0.5">Decoration Service</p>
          </div>
        </a>

        {/* Permanent Responsive Search Bar */}
        <div className="w-full lg:max-w-xs xl:max-w-sm order-3 lg:order-2 mx-auto lg:mx-0 relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search authentic dishes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-4 py-2 border border-orange-200 focus:border-orange-500 hover:border-orange-300 rounded-full text-xs font-semibold outline-none pr-10 bg-orange-50/25 text-stone-800 transition-colors"
            />
            <button type="submit" className="absolute right-3.5 text-orange-600 hover:text-orange-700 flex items-center justify-center p-1" aria-label="Search">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setShowSuggestions(false)} 
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 right-0 mt-2 bg-white border border-orange-200 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-orange-50 max-h-72 overflow-y-auto"
                >
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSearchQuery(item.name);
                        setShowSuggestions(false);
                        window.location.href = `/order.html?search=${encodeURIComponent(item.name.trim())}`;
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-orange-50 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 max-w-[70%] text-stone-900">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-7 h-7 object-cover rounded-md group-hover:scale-105 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="truncate text-xs font-bold text-stone-850">
                          {item.name}
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-orange-600 shrink-0 select-none">
                        {item.price ? `₹${item.price}` : `₹${item.halfPrice}/Full`}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 order-2 lg:order-3">
          <nav className="hidden lg:flex items-center gap-8">
            {displayNavItems.map((item) => (
              <a 
                key={item.name} 
                href={item.href}
                className={`text-sm font-bold transition-colors ${
                  (typeof window !== 'undefined' && window.location.pathname === item.href) ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'
                }`}
              >
                {item.name}
              </a>
            ))}

            {user ? (
              <div className="flex items-center gap-4 border-l border-orange-100 pl-6">
                {role === 'admin' && (
                  <a 
                    href="/admin-dashboard"
                    className="text-sm font-black text-orange-600 hover:text-white hover:bg-orange-600 bg-orange-50 px-4 py-2 border-2 border-orange-100 rounded-xl transition-all"
                    id="header-dashboard-link"
                  >
                    Dashboard
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold text-neutral-600 hover:text-red-600 transition-colors cursor-pointer"
                  id="header-logout-btn"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sm font-extrabold text-white bg-orange-600 hover:bg-orange-700 px-5 py-2.5 rounded-2xl transition-all shadow-md shadow-orange-500/10 active:scale-[0.98] cursor-pointer"
                id="header-login-btn"
              >
                Login / Signup
              </button>
            )}
          </nav>

          {/* Cart trigger button with reactive count */}
          {user && (
            <button
              onClick={triggerCartOpen}
              className="relative p-2.5 text-stone-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all cursor-pointer flex items-center justify-center"
              id="header-cart-trigger"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Login indicator or menu trigger */}
          {!user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="lg:hidden text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              id="mobile-header-login-btn"
            >
              Register/Login
            </button>
          )}

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-800 lg:hidden"
            id="menu-toggle"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-sky-100 border-t border-sky-200 overflow-hidden shadow-inner"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {displayNavItems.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-lg font-bold py-2 border-b border-sky-200/60 last:border-0 ${
                    (typeof window !== 'undefined' && window.location.pathname === item.href) ? 'text-orange-600 font-black' : 'text-stone-800 hover:text-orange-600'
                  }`}
                >
                  {item.name}
                </a>
              ))}

              <div className="pt-2">
                {user ? (
                  <div className="flex flex-col gap-3">
                    {role === 'admin' && (
                      <a
                        href="/admin-dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full text-center py-2.5 bg-orange-50 text-orange-600 border border-orange-100 font-extrabold rounded-xl"
                      >
                        Go to Dashboard
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-center py-2.5 bg-red-50 text-red-600 font-bold rounded-xl"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-center py-3 bg-orange-600 text-white font-extrabold rounded-2xl"
                  >
                    Login / Signup
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-orange-100 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-orange-600" />
                  <span>+91 9650254164</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-orange-600" />
                  <span>ranjanjha2012@gmail.com</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}

