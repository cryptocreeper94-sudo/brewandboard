import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Shop, EXTENDED_DELIVERY_PREMIUM, EXTENDED_DELIVERY_RADIUS_MILES } from '@/lib/mock-data';

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

export interface VendorLocation {
  lat: number;
  lng: number;
}

export type GratuityOption = 0 | 15 | 18 | 20 | 'custom';

interface CartContextType {
  items: CartItem[];
  vendorId: string | null;
  vendorName: string | null;
  vendorLocation: VendorLocation | null;
  addItem: (vendor: Shop, product: Product) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  calculateDeliveryFee: (deliveryLat: number, deliveryLng: number) => { baseFee: number; extendedFee: number; distance: number; isExtended: boolean };
  subtotal: number;
  itemCount: number;
  serviceFee: number;
  deliveryFee: number;
  gratuityOption: GratuityOption;
  customGratuity: number;
  gratuityAmount: number;
  setGratuityOption: (option: GratuityOption) => void;
  setCustomGratuity: (amount: number) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'brewboard_cart';
const SERVICE_FEE_RATE = 0.15;
const DELIVERY_FEE = 5.00;

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState<string | null>(null);
  const [vendorLocation, setVendorLocation] = useState<VendorLocation | null>(null);
  const [gratuityOption, setGratuityOption] = useState<GratuityOption>(18);
  const [customGratuity, setCustomGratuity] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(parsed.items || []);
        setVendorId(parsed.vendorId || null);
        setVendorName(parsed.vendorName || null);
        setVendorLocation(parsed.vendorLocation || null);
        setGratuityOption(parsed.gratuityOption ?? 18);
        setCustomGratuity(parsed.customGratuity ?? 0);
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items,
      vendorId,
      vendorName,
      vendorLocation,
      gratuityOption,
      customGratuity
    }));
  }, [items, vendorId, vendorName, vendorLocation, gratuityOption, customGratuity]);

  const addItem = (vendor: Shop, product: Product) => {
    if (vendorId && vendorId !== vendor.id) {
      if (!confirm(`Your cart has items from ${vendorName}. Would you like to clear it and start a new order from ${vendor.name}?`)) {
        return;
      }
      setItems([]);
    }

    setVendorId(vendor.id);
    setVendorName(vendor.name);
    setVendorLocation({ lat: vendor.lat, lng: vendor.lng });

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
    setVendorLocation(null);
    setGratuityOption(18);
    setCustomGratuity(0);
  };

  const getItemQuantity = (itemId: string) => {
    const item = items.find(i => i.itemId === itemId);
    return item?.quantity || 0;
  };

  const calculateDeliveryFee = (deliveryLat: number, deliveryLng: number) => {
    if (!vendorLocation) {
      return { baseFee: DELIVERY_FEE, extendedFee: 0, distance: 0, isExtended: false };
    }
    const distance = calculateDistance(vendorLocation.lat, vendorLocation.lng, deliveryLat, deliveryLng);
    const isExtended = distance > EXTENDED_DELIVERY_RADIUS_MILES;
    return {
      baseFee: DELIVERY_FEE,
      extendedFee: isExtended ? EXTENDED_DELIVERY_PREMIUM : 0,
      distance,
      isExtended
    };
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  
  const gratuityAmount = gratuityOption === 'custom' 
    ? customGratuity 
    : subtotal * (gratuityOption / 100);
  
  const total = subtotal + serviceFee + deliveryFee + gratuityAmount;

  return (
    <CartContext.Provider value={{
      items,
      vendorId,
      vendorName,
      vendorLocation,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemQuantity,
      calculateDeliveryFee,
      subtotal,
      itemCount,
      serviceFee,
      deliveryFee,
      gratuityOption,
      customGratuity,
      gratuityAmount,
      setGratuityOption,
      setCustomGratuity,
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
