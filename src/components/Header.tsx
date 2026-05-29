import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AuthModal from './AuthModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Direct session validation: only authenticated and verified users or organic Google users are logged in
      if (currentUser && (currentUser.emailVerified || currentUser.providerData.some(p => p.providerId === 'google.com'))) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
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

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Tiffin Service', href: '/tiffin.html' },
    { name: 'Order Online', href: '/order.html' },
    { name: 'Event Gallery', href: '/gallery.html' },
    { name: 'AI Planner', href: '/planner.html' },
    { name: 'Contact Us', href: '/contact.html' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-40 border-b border-orange-100">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href="/" className="flex items-center gap-3">
          <img 
            src="https://i.ibb.co/Y4fS5FDr/file-000000003bec71faa9b37e16b055cb49.png" 
            alt="Mithila Catering Logo" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-lg sm:text-xl font-black text-orange-800 leading-tight">Mithila Catering &</h1>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Decoration Service</p>
          </div>
        </a>

        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
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
                <a 
                  href="/dashboard.html"
                  className="text-sm font-black text-orange-600 hover:text-white hover:bg-orange-600 bg-orange-50 px-4 py-2 border-2 border-orange-100 rounded-xl transition-all"
                  id="header-dashboard-link"
                >
                  Dashboard
                </a>
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

          {/* Mobile Login indicator or menu trigger */}
          {!user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="lg:hidden text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              id="mobile-header-login-btn"
            >
              Login
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
            className="lg:hidden bg-white border-t border-orange-50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navItems.map((item) => (
                <a 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-lg font-semibold py-2 border-b border-orange-50 last:border-0 ${
                    (typeof window !== 'undefined' && window.location.pathname === item.href) ? 'text-orange-600' : 'text-gray-800 hover:text-orange-600'
                  }`}
                >
                  {item.name}
                </a>
              ))}

              <div className="pt-2">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <a
                      href="/dashboard.html"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full text-center py-2.5 bg-orange-50 text-orange-600 border border-orange-100 font-extrabold rounded-xl"
                    >
                      Go to Dashboard
                    </a>
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
