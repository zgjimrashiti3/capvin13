import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartItem } from '../types';
import { cartKey } from '../utils/sizes';

interface CartContextValue {
  items: CartItem[];
  tableNumber: number | null;
  setTableNumber: (n: number) => void;
  addItem: (item: CartItem) => void;
  // `key` is the cart line key from cartKey() (item id + size).
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateNotes: (key: string, notes: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'capvin_cart';
const TABLE_KEY = 'capvin_table';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [tableNumber, setTableNumberState] = useState<number | null>(() => {
    const stored = localStorage.getItem(TABLE_KEY);
    return stored ? Number(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const setTableNumber = useCallback((n: number) => {
    localStorage.setItem(TABLE_KEY, String(n));
    setTableNumberState(n);
  }, []);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const key = cartKey(newItem);
      const existing = prev.find((i) => cartKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          cartKey(i) === key
            ? { ...i, quantity: Math.min(20, i.quantity + newItem.quantity), notes: newItem.notes || i.notes }
            : i,
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => cartKey(i) !== key));
  }, []);

  // quantity 0 → auto-remove the item
  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => cartKey(i) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (cartKey(i) === key ? { ...i, quantity: Math.min(20, quantity) } : i)),
    );
  }, []);

  const updateNotes = useCallback((key: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (cartKey(i) === key ? { ...i, notes } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, tableNumber, setTableNumber, addItem, removeItem, updateQuantity, updateNotes, clearCart, totalPrice, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
