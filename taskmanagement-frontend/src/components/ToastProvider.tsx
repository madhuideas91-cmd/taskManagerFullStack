// src/components/ToastProvider.tsx
import React, { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: string; message: string; type?: "success" | "error" | "info" };

const ToastContext = createContext<any>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = String(Date.now() + Math.random());
    setToasts((t) => [{ id, message, type }, ...t]);
    // auto-remove after 4s
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container (keeps separate from app markup) */}
      <div
        aria-live="polite"
        className="fixed right-4 bottom-6 z-50 flex flex-col gap-2 items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow-md max-w-xs break-words text-sm ${
              t.type === "success" ? "bg-green-500 text-white" : t.type === "error" ? "bg-red-500 text-white" : "bg-gray-800 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx as { addToast: (message: string, type?: "success" | "error" | "info") => void; removeToast: (id: string) => void };
};
