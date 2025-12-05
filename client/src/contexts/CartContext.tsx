import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Shop, ModifierOption, EXTENDED_DELIVERY_PREMIUM, EXTENDED_DELIVERY_RADIUS_MILES } from '@/lib/mock-data';

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  option: ModifierOption;
}

export interface CartItem {
  vendorId: string;
  vendorName: string;
  itemId: string;
  name: string;
  description: string;
  basePrice: number;
  price: number; // total with modifiers
  quantity: number;
  category: string;
  selectedModifiers?: SelectedModifier[];
  specialInstructions?: string;
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
  addItem: (vendor: Shop, product: Product, modifiers?: SelectedModifier[], specialInstructions?: string) => void;
  removeItem: (itemId: string, modifiersKey?: string) => void;
  updateQuantity: (itemId: string, quantity: number, modifiersKey?: string) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  calculateDeliveryFee: (deliveryLat: number, deliveryLng: number) => { baseFee: number; extendedFee: number; distance: number; isExtended: boolean };
  subtotal: number;
  itemCount: number;
  salesTax: number;
  serviceFee: number;
  deliveryFee: number;
  gratuityOption: GratuityOption;
  customGratuity: number;
  gratuityAmount: number;
  isAutoGratuity: boolean;
  setGratuityOption: (option: GratuityOption) => void;
  setCustomGratuity: (amount: number) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'brewboard_cart';
const SERVICE_FEE_RATE = 0.15;
const DELIVERY_FEE = 5.00;
const TN_SALES_TAX_RATE = 0.0925; // Tennessee state (7%) + Nashville local (2.25%)
const AUTO_GRATUITY_THRESHOLD = 100; // $100+ orders get automatic 18% gratuity
const AUTO_GRATUITY_RATE = 0.18; // 18% auto gratuity for large orders

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

function getModifiersKey(modifiers?: SelectedModifier[]): string {
  if (!modifiers || modifiers.length === 0) return '';
  return modifiers.map(m => `${m.groupId}:${m.option.id}`).sort().join('|');
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

  const addItem = (vendor: Shop, product: Product, modifiers?: SelectedModifier[], specialInstructions?: string) => {
    if (vendorId && vendorId !== vendor.id) {
      if (!confirm(`Your cart has items from ${vendorName}. Would you like to clear it and start a new order from ${vendor.name}?`)) {
        return;
      }
      setItems([]);
    }

    setVendorId(vendor.id);
    setVendorName(vendor.name);
    setVendorLocation({ lat: vendor.lat, lng: vendor.lng });

    // Calculate total price with modifiers
    const modifierTotal = modifiers?.reduce((sum, m) => sum + m.option.price, 0) || 0;
    const totalPrice = product.price + modifierTotal;
    const modifiersKey = getModifiersKey(modifiers);

    setItems(prev => {
      // Check if item with same modifiers already exists
      const existingIndex = prev.findIndex(
        item => item.itemId === product.id && getModifiersKey(item.selectedModifiers) === modifiersKey
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      return [...prev, {
        vendorId: vendor.id,
        vendorName: vendor.name,
        itemId: product.id,
        name: product.name,
        description: product.description,
        basePrice: product.price,
        price: totalPrice,
        quantity: 1,
        category: product.category,
        selectedModifiers: modifiers,
        specialInstructions,
      }];
    });
  };

  const removeItem = (itemId: string, modifiersKey?: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => {
        if (item.itemId !== itemId) return true;
        if (modifiersKey !== undefined) {
          return getModifiersKey(item.selectedModifiers) !== modifiersKey;
        }
        return false;
      });
      if (filtered.length === 0) {
        setVendorId(null);
        setVendorName(null);
        setVendorLocation(null);
      }
      return filtered;
    });
  };

  const updateQuantity = (itemId: string, quantity: number, modifiersKey?: string) => {
    if (quantity <= 0) {
      removeItem(itemId, modifiersKey);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.itemId !== itemId) return item;
        if (modifiersKey !== undefined && getModifiersKey(item.selectedModifiers) !== modifiersKey) {
          return item;
        }
        return { ...item, quantity };
      })
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
    return items
      .filter(item => item.itemId === itemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const calculateDeliveryFee = (deliveryLat: number, deliveryLng: number) => {
    if (!vendorLocation) {
      return { baseFee: DELIVERY_FEE, extendedFee: 0, distance: 0, isExtended: false };
    }

    const distance = calculateDistance(
      vendorLocation.lat,
      vendorLocation.lng,
      deliveryLat,
      deliveryLng
    );

    const isExtended = distance > EXTENDED_DELIVERY_RADIUS_MILES;
    const extendedFee = isExtended ? EXTENDED_DELIVERY_PREMIUM : 0;

    return {
      baseFee: DELIVERY_FEE,
      extendedFee,
      distance,
      isExtended
    };
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const salesTax = subtotal * TN_SALES_TAX_RATE;
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const deliveryFee = DELIVERY_FEE;

  // Auto-gratuity logic: $100+ orders get mandatory 18%
  const isAutoGratuity = subtotal >= AUTO_GRATUITY_THRESHOLD;

  const gratuityAmount = (() => {
    if (isAutoGratuity) {
      // Forced 18% for large orders
      return subtotal * AUTO_GRATUITY_RATE;
    }
    // User-selected tip for smaller orders
    if (gratuityOption === 'custom') {
      return customGratuity;
    }
    if (gratuityOption === 0) {
      return 0;
    }
    return subtotal * (gratuityOption / 100);
  })();

  const total = subtotal + salesTax + serviceFee + deliveryFee + gratuityAmount;

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
      salesTax,
      serviceFee,
      deliveryFee,
      gratuityOption,
      customGratuity,
      gratuityAmount,
      isAutoGratuity,
      setGratuityOption,
      setCustomGratuity,
      total,
    }}>
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
