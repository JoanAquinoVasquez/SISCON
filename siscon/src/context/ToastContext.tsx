// src/context/ToastContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={containerStyle}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Toast Component
const Toast = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const colors = {
    success: { bg: "#10b981", icon: "✓" },
    error: { bg: "#ef4444", icon: "✕" },
    warning: { bg: "#f59e0b", icon: "⚠" },
    info: { bg: "#3b82f6", icon: "ℹ" },
  };

  const color = colors[toast.type];

  return (
    <div style={{ ...toastStyle, backgroundColor: color.bg }}>
      <div style={iconStyle}>{color.icon}</div>
      <div style={messageStyle}>{toast.message}</div>
      <button onClick={onClose} style={closeButtonStyle}>
        ×
      </button>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  position: "fixed",
  top: "20px",
  right: "20px",
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const toastStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 16px",
  borderRadius: "8px",
  color: "white",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  minWidth: "300px",
  maxWidth: "400px",
  animation: "slideIn 0.3s ease-out",
};

const iconStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "bold",
};

const messageStyle: React.CSSProperties = {
  flex: 1,
  fontSize: "14px",
};

const closeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "24px",
  cursor: "pointer",
  padding: "0",
  lineHeight: "1",
  opacity: 0.8,
};

// Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
