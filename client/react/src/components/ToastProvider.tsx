import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    dismissing?: boolean;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let idCounter = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = "info") => {
        const id = idCounter++;
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => dismissToast(id), 4000);
    };

    const dismissToast = (id: number) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
        );

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 400);
    };

    const removeToast = (id: number) => {
        dismissToast(id);
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {createPortal(
                <div className="fixed inset-x-0 bottom-8 flex flex-col items-center gap-3 pointer-events-none z-50">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`
                alert pointer-events-auto shadow-2xl px-6 py-4 rounded-lg flex items-center gap-4
                ${toast.type === "success" ? "alert-success" : ""}
                ${toast.type === "error" ? "alert-error" : ""}
                ${toast.type === "info" ? "alert-info" : "bg-base-200 border"}
                ${toast.dismissing ? "animate-toast-out" : "animate-toast-in"}
              `}
                            onClick={() => removeToast(toast.id)}
                        >
                            <span className="font-medium text-white">{toast.message}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeToast(toast.id);
                                }}
                                className="ml-auto text-xl text-white opacity-80 hover:opacity-100"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context.addToast;
};