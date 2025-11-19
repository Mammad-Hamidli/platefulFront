import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  toasts: Toast[];
  modals: Record<string, boolean>;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: (id: string) => void;
  openModal: (name: string) => void;
  closeModal: (name: string) => void;
  isModalOpen: (name: string) => boolean;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  modals: {},
  showToast: (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => {
      get().hideToast(id);
    }, 5000);
  },
  hideToast: (id: string) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
  openModal: (name: string) => {
    set({ modals: { ...get().modals, [name]: true } });
  },
  closeModal: (name: string) => {
    set({ modals: { ...get().modals, [name]: false } });
  },
  isModalOpen: (name: string) => {
    return get().modals[name] || false;
  },
}));

