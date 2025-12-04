import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Shop } from '@/lib/mock-data';

export interface CartItem {
  vendorId: string;
  vendorName: string;
  itemId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  vendorId: string | null;
  vendorName: string | null;
  addItem: (vendor: Shop, product: Product) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  subtotal: number;
  itemCount: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'brewboard_cart';
const SERVICE_FEE_RATE = 0.15;
const DELIVERY_FEE = 5.00;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(parsed.items || []);
        setVendorId(parsed.vendorId || null);
        setVendorName(parsed.vendorName || null);
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items,
      vendorId,
      vendorName
    }));
  }, [items, vendorId, vendorName]);

  const addItem = (vendor: Shop, product: Product) => {
    if (vendorId && vendorId !== vendor.id) {
      if (!confirm(`Your cart has items from ${vendorName}. Would you like to clear it and start a new order from ${vendor.name}?`)) {
        return;
      }
      setItems([]);
    }

    setVendorId(vendor.id);
    setVendorName(vendor.name);

    setItems(prev => {
      const existing = prev.find(item => item.itemId === product.id);
      if (existing) {
        return prev.map(item =>
          item.itemId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        vendorId: vendor.id,
        vendorName: vendor.name,
        itemId: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: 1,
        category: product.category
      }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.itemId !== itemId);
      if (newItems.length === 0) {
        setVendorId(null);
        setVendorName(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.itemId === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setVendorId(null);
    setVendorName(null);
  };

  const getItemQuantity = (itemId: string) => {
    const item = items.find(i => i.itemId === itemId);
    return item?.quantity || 0;
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + serviceFee + deliveryFee;

  return (
    <CartContext.Provider value={{
      items,
      vendorId,
      vendorName,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      subtotal,
      itemCount,
      serviceFee,
      deliveryFee,
      total
    }}>
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
