import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, logUserActivity } from '../lib/firebase';

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
  placeOrder: (formData: any, paymentMethod: 'COD' | 'UPI' | 'PAYU') => Promise<string>;
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

  // Listen to Auth State to load and override cart on login or completely wipe on logout
  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (active) {
            if (userSnap.exists()) {
              const data = userSnap.data();
              const cloudCart: CartItem[] = data.cart || [];
              setCart(cloudCart);
            } else {
              setCart([]);
            }
          }
        } catch (err) {
          console.error("Error reading user cart from Firestore:", err);
          if (active) {
            setCart([]);
          }
        }
      } else {
        if (active) {
          setCart([]);
          localStorage.removeItem('mithila_cart');
          sessionStorage.removeItem('mithila_cart');
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Save cart to localStorage and optionally Firestore on state change
  useEffect(() => {
    localStorage.setItem('mithila_cart', JSON.stringify(cart));
    // Dispatch global event for non-context headers (e.g. multi-page decoupled headers)
    window.dispatchEvent(new CustomEvent('mithila_cart_updated'));

    const syncToFirebase = async () => {
      if (auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await setDoc(userRef, { cart }, { merge: true });
        } catch (err) {
          console.error("Error syncing cart to Firestore:", err);
        }
      }
    };

    syncToFirebase();
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

    logUserActivity('Added to Cart', { itemName: item.name, price: finalPrice, size });
  };

  const removeFromCart = (id: string) => {
    const item = cart.find((i) => i.id === id);
    if (item) {
      logUserActivity('Removed from Cart', { itemName: item.name, size: item.size, qty: item.quantity });
    }
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    const item = cart.find((i) => i.id === id);
    if (item) {
      logUserActivity('Updated Cart Item Quantity', { itemName: item.name, oldQty: item.quantity, newQty: qty, size: item.size });
    }
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

  const placeOrder = async (formData: any, paymentMethod: 'COD' | 'UPI' | 'PAYU'): Promise<string> => {
    if (!auth.currentUser) {
      throw new Error('Please log in to place your order.');
    }

    const orderPayload = {
      userId: auth.currentUser.uid,
      customerName: formData.name,
      customerPhone: formData.number,
      customerEmail: auth.currentUser.email || '',
      userName: formData.name,
      userPhone: formData.number,
      whatsapp: formData.whatsapp,
      address: formData.address,
      location: formData.location || 'General',
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity
      })),
      subtotal: cartTotal,
      packingCharge: 12,
      deliveryCharge: 40,
      totalAmount: cartTotal + 12 + 40, // packing + delivery charges
      status: 'Placed',
      paymentMethod,
      orderDate: formData.orderDate || new Date().toISOString().split('T')[0],
      orderTime: formData.orderTime || new Date().toTimeString().split(' ')[0],
      createdAt: new Date().toISOString()
    };

    const pathForWrite = 'orders';
    try {
      const docRef = await addDoc(collection(db, pathForWrite), orderPayload);
      await logUserActivity('Placed Order', { orderId: docRef.id, totalAmount: orderPayload.totalAmount, itemsCount: orderPayload.items.length, items: orderPayload.items.map(it => `${it.name} (${it.size}) x${it.quantity}`) });
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
