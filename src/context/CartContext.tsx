import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface CartItem {
  id: string; // Unique composite key: menuItemId + '-' + size
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  size: 'half' | 'full' | 'single';
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any, size?: 'half' | 'full' | 'single') => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  placeOrder: (formData: any, paymentMethod: 'COD' | 'UPI') => Promise<string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mithila_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }
  }, []);

  // Save cart to localStorage on state change
  useEffect(() => {
    localStorage.setItem('mithila_cart', JSON.stringify(cart));
    // Dispatch global event for non-context headers (e.g. multi-page decoupled headers)
    window.dispatchEvent(new CustomEvent('mithila_cart_updated'));
  }, [cart]);

  const addToCart = (item: any, size: 'half' | 'full' | 'single' = 'single') => {
    // Determine the correct price based on size
    let finalPrice = item.price || 0;
    if (size === 'half') finalPrice = item.halfPrice || item.price || 0;
    if (size === 'full') finalPrice = item.fullPrice || item.price || 0;

    const id = `${item.id}-${size}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id,
          menuItemId: item.id,
          name: item.name,
          price: finalPrice,
          quantity: 1,
          size,
          image: item.image,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const placeOrder = async (formData: any, paymentMethod: 'COD' | 'UPI'): Promise<string> => {
    if (!auth.currentUser) {
      throw new Error('Please log in to place your order.');
    }

    const orderPayload = {
      userId: auth.currentUser.uid,
      userName: formData.name,
      userPhone: formData.number,
      whatsapp: formData.whatsapp,
      address: formData.address,
      location: formData.location || 'General',
      items: JSON.stringify(cart.map(i => ({
        name: i.name,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity
      }))),
      totalAmount: cartTotal + 12 + 40, // packing + delivery charges
      status: 'Pending',
      paymentMethod,
      orderDate: formData.orderDate || new Date().toISOString().split('T')[0],
      orderTime: formData.orderTime || new Date().toTimeString().split(' ')[0],
      createdAt: new Date().toISOString()
    };

    const pathForWrite = 'orders';
    try {
      const docRef = await addDoc(collection(db, pathForWrite), orderPayload);
      clearCart();
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, pathForWrite);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
