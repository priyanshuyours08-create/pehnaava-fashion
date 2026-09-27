import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'pehnaava_cart_v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [items]);

  // Calculate cartCount (total quantity) & cartTotal (subtotal)
  const cartCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const cartTotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = (product, size = 'M') => {
    if (!product || !product.id) return;
    const cleanSize = size || 'M';

    setItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (i) => i.id === product.id && i.size === cleanSize
      );

      if (existingIdx > -1) {
        const next = [...prevItems];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + 1,
        };
        return next;
      }

      return [
        ...prevItems,
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          price: product.price,
          priceFormatted: product.priceFormatted || `₹${Number(product.price).toLocaleString('en-IN')}`,
          image: product.images?.[0] || product.image,
          size: cleanSize,
          quantity: 1,
        },
      ];
    });

    // Requirement 13: automatically open CartDrawer when item is added
    setIsCartOpen(true);
  };

  const removeItem = (id, size) => {
    setItems((prevItems) =>
      prevItems.filter((i) => !(i.id === id && (size ? i.size === size : true)))
    );
  };

  const updateQuantity = (id, quantity, size) => {
    const qty = Number(quantity);
    if (qty <= 0) {
      removeItem(id, size);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id && (size ? item.size === size : true)) {
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
