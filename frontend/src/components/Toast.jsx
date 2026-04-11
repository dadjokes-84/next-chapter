import React, { useState } from 'react';

export const ToastContext = React.createContext();

let toastId = 0;

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = toastId++;
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
  }[type] || 'bg-gray-100 border-gray-400 text-gray-800';

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }[type] || '•';

  return (
    <div className={`border-l-4 p-4 rounded shadow-lg ${bgColor} flex items-start justify-between animate-slideIn`}>
      <div className="flex items-start gap-3">
        <span className="text-lg font-bold">{icon}</span>
        <span className="text-sm">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-lg hover:opacity-50 transition flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
