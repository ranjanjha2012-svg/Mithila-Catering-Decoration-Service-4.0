import React, { useState, useEffect } from 'react';
import { CartProvider } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';

interface CateringRootProps {
  children: React.ReactNode;
}

export default function CateringRoot({ children }: CateringRootProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Listen to custom window events to easily open Cart or Auth modal from anywhere in the app
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    const handleCloseCart = () => setIsCartOpen(false);
    const handleOpenAuth = () => setIsAuthOpen(true);
    const handleCloseAuth = () => setIsAuthOpen(false);

    window.addEventListener('open-mithila-cart', handleOpenCart);
    window.addEventListener('close-mithila-cart', handleCloseCart);
    window.addEventListener('open-mithila-auth', handleOpenAuth);
    window.addEventListener('close-mithila-auth', handleCloseAuth);

    return () => {
      window.removeEventListener('open-mithila-cart', handleOpenCart);
      window.removeEventListener('close-mithila-cart', handleCloseCart);
      window.removeEventListener('open-mithila-auth', handleOpenAuth);
      window.removeEventListener('close-mithila-auth', handleCloseAuth);
    };
  }, []);

  return (
    <CartProvider>
      {children}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onLoginRequest={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </CartProvider>
  );
}
