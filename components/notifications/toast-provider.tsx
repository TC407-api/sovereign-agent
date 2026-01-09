'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  title: string;
  variant?: 'default' | 'destructive';
  action?: ToastAction;
}

interface ToastContextValue {
  toast: (options: Omit<Toast, 'id'>) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...options, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismissAll }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            data-variant={t.variant || 'default'}
            role="status"
            className="p-4 rounded shadow-md bg-white border flex items-center justify-between gap-4"
          >
            <span>{t.title}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action?.onClick();
                }}
                className="px-2 py-1 text-sm font-semibold border rounded"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
