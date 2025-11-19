import { create } from 'zustand';
import { Order, OrderItem } from '../types';

interface OrderState {
  cart: OrderItem[];
  currentOrder: Order | null;
  notes: string;
  version: number;
  addToCart: (item: OrderItem) => void;
  removeFromCart: (menuItemId: number) => void;
  updateCartItem: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  setCurrentOrder: (order: Order | null) => void;
  setNotes: (notes: string) => void;
  getCartTotal: () => number;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  cart: [],
  currentOrder: null,
  notes: '',
  version: 0,
  addToCart: (item: OrderItem) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(
      (i) => i.menuItemId === item.menuItemId
    );
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += item.quantity;
      set({ cart: updated });
    } else {
      set({ cart: [...cart, item] });
    }
  },
  removeFromCart: (menuItemId: number) => {
    set({ cart: get().cart.filter((item) => item.menuItemId !== menuItemId) });
  },
  updateCartItem: (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(menuItemId);
      return;
    }
    const { cart } = get();
    const updated = cart.map((item) =>
      item.menuItemId === menuItemId ? { ...item, quantity } : item
    );
    set({ cart: updated });
  },
  clearCart: () => {
    set({ cart: [], notes: '' });
  },
  setCurrentOrder: (order: Order | null) => {
    set({ currentOrder: order, version: order?.version || 0 });
  },
  setNotes: (notes: string) => {
    set({ notes });
  },
  getCartTotal: () => {
    return get().cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
}));

