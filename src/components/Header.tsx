import React, { useState } from 'react';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Tiffin Service', href: '/tiffin-service' },
    { name: 'Event Gallery', href: '/#gallery' },
    { name: 'AI Planner', href: '/#ai-planner' },
    { name: 'Contact Us', href: '/#contact' },
  ];

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith('/#')) {
      const id = href.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-40 border-b border-orange-100">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="https://i.ibb.co/Y4fS5FDr/file-000000003bec71faa9b37e16b055cb49.png" 
            alt="Mithila Catering Logo" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-lg sm:text-xl font-black text-orange-800 leading-tight">Mithila Catering &</h1>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Decoration Service</p>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              item.href.startsWith('/#') ? (
                <a 
                  key={item.name} 
                  href={item.href}
                  className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors"
                >
                  {item.name}
                </a>
              ) : (
                <Link 
                  key={item.name} 
                  to={item.href}
                  className={`text-sm font-bold transition-colors ${
                    location.pathname === item.href ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

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
                item.href.startsWith('/#') ? (
                  <a 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-semibold text-gray-800 hover:text-orange-600 py-2 border-b border-orange-50 last:border-0"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link 
                    key={item.name} 
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-lg font-semibold py-2 border-b border-orange-50 last:border-0 ${
                      location.pathname === item.href ? 'text-orange-600' : 'text-gray-800 hover:text-orange-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
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
    </header>
  );
}
