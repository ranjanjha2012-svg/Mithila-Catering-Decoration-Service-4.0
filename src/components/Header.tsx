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

  // Simple language switcher English / Hindi
  const [lang, setLang] = useState<'en' | 'hi'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('mithila_lang') as 'en' | 'hi') || 'en';
    }
    return 'en';
  });

  // Programmatic Google Translate Initialization and Configuration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Inject hidden container for Google Translate to load into
    let elem = document.getElementById('google_translate_element');
    if (!elem) {
      elem = document.createElement('div');
      elem.id = 'google_translate_element';
      elem.style.display = 'none';
      document.body.appendChild(elem);
    }

    // 2. Define global callback for Google Web Translate
    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'hi,en',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      }
    };

    // 3. Load script if not already fetched
    const existingScript = document.getElementById('google-translate-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // 4. Inject global styles to cleanly hide all translation banners/frames
    const styleId = 'google-translate-cleanup-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        #google_translate_element, 
        .skiptranslate, 
        .goog-te-banner-frame, 
        .goog-te-balloon-frame, 
        .goog-te-banner,
        iframe.goog-te-banner-frame {
          display: none !important;
          visibility: hidden !important;
          height: 0px !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        font {
          background-color: transparent !important;
          box-shadow: none !important;
          color: inherit !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Sync translation cookies and dropdown triggers dynamically on lang state change
  useEffect(() => {
    localStorage.setItem('mithila_lang', lang);

    const cookieValue = lang === 'hi' ? '/en/hi' : '/en/en';
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname};`;

    const triggerSelectorUpdate = () => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (combo) {
        if (combo.value !== lang) {
          combo.value = lang;
          combo.dispatchEvent(new Event('change'));
        }
      }
    };

    triggerSelectorUpdate();
    const interval = setInterval(triggerSelectorUpdate, 800);
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [lang]);

  // Synchronize state if language change is dispatched from other sessions/pages
  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail !== lang) {
        setLang(customEvent.detail);
      }
    };
    window.addEventListener('mithila_lang_updated', handleEvent);
    return () => {
      window.removeEventListener('mithila_lang_updated', handleEvent);
    };
  }, [lang]);

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    window.dispatchEvent(new CustomEvent('mithila_lang_updated', { detail: nextLang }));
  };

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
    { name: 'Contact Us', href: '/contact.html' },
  ];

  const displayNavItems = user 
    ? [...navItems, { name: 'My Orders', href: '/my-orders.html' }, { name: 'My Profile', href: '/profile.html' }] 
    : navItems;

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#e0f7fa]/95 backdrop-blur-md z-40 border-b border-cyan-200/50 shadow-sm">
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
      <div className="container mx-auto px-4 py-2.5 flex flex-col lg:flex-row justify-between lg:items-center gap-3">
        {/* Top bar for mobile: Logo & Brand on left, Cart & Register/Login on right */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-3 shrink-0">
          <a href="/" className="flex items-center gap-2.5 sm:gap-3 shrink">
            <img 
              src="https://i.ibb.co/Y4fS5FDr/file-000000003bec71faa9b37e16b055cb49.png" 
              alt="Mithila Catering Logo" 
              className="h-9 w-9 sm:h-12 sm:w-12 object-contain shrink-0"
            />
            <div className="shrink-0 text-left">
              <h1 className="text-xs sm:text-lg font-black text-red-800 leading-tight">Mithila Catering &</h1>
              <p className="text-[7.5px] sm:text-xs font-bold text-orange-600 uppercase tracking-widest leading-none mt-1">Decoration Service</p>
            </div>
          </a>

          {/* Mobile Interactive Actions Container */}
          <div className="flex items-center gap-2 lg:hidden shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="px-2 py-1 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg text-[10px] font-black text-orange-700 transition-all cursor-pointer whitespace-nowrap shrink-0 tracking-wider notranslate"
              title="Toggle Language / भाषा बदलें"
            >
              {lang === 'en' ? 'हिन्दी' : 'EN'}
            </button>

            {/* Cart trigger button with reactive count */}
            {user && (
              <button
                onClick={triggerCartOpen}
                className="relative p-2 text-stone-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0"
                id="header-cart-trigger-mobile"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-orange-600 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {!user && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[10px] font-black text-white bg-orange-600 hover:bg-orange-700 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
                id="mobile-header-login-btn-new"
              >
                Register/Login
              </button>
            )}

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 hover:bg-stone-200/50 rounded-lg transition-colors text-[#5c4033] shrink-0 select-none flex items-center justify-center"
              id="menu-toggle"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar - Under mobile logo, centered on desktop */}
        <div className="w-full lg:max-w-xs xl:max-w-sm relative">
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

        {/* Desktop Nav Items */}
        <div className="hidden lg:flex items-center gap-3 sm:gap-6">
          <nav className="flex items-center gap-8">
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

          {/* Language Switcher Button */}
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 border border-orange-200 bg-white hover:bg-orange-50 text-orange-700 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all shrink-0 select-none notranslate"
            title="Toggle Language / भाषा बदलें"
          >
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>

          {/* Desktop-only Cart trigger button with reactive count */}
          {user && (
            <button
              onClick={triggerCartOpen}
              className="relative p-2.5 text-stone-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0"
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
                <div className="flex items-start gap-3 text-xs sm:text-sm text-gray-600">
                  <Mail size={16} className="text-orange-600 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-semibold">ranjanjha@mithilacatering.com</span>
                    <span className="text-[11px] text-gray-500">mithilacateringservices@gmail.com</span>
                  </div>
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

