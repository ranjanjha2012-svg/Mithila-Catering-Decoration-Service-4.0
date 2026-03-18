import React, { useState } from 'react';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Tiffin Service', href: '/services' },
    { name: 'Event Gallery', href: '/gallery' },
    { name: 'AI Planner', href: '/planner' },
    { name: 'Contact Us', href: '/contact' },
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
                className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors"
              >
                {item.name}
              </a>
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
                <a 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-semibold text-gray-800 hover:text-orange-600 py-2 border-b border-orange-50 last:border-0"
                >
                  {item.name}
                </a>
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
