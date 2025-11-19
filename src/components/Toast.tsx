import React from 'react';
import { useUIStore, Toast as ToastType } from '../store/uiStore';

export const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`${typeStyles[toast.type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] max-w-md`}
    >
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

