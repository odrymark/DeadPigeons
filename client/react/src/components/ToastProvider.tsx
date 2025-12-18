import {createContext, type ReactNode, useContext, useState} from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
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
        const newToast: Toast = { id, message, type };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {createPortal(
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 pointer-events-none">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`
                alert 
                ${toast.type === "success" ? "alert-success" : ""}
                ${toast.type === "error" ? "alert-error" : ""}
                ${toast.type === "info" ? "alert-info" : ""}
                shadow-2xl px-6 py-4 rounded-lg flex items-center gap-3
                animate-fade-in-up pointer-events-auto
              `}
                            onClick={() => removeToast(toast.id)}
                        >
                            <span className="font-medium text-white">{toast.message}</span>
                            <button className="ml-auto text-xl text-white opacity-80 hover:opacity-100">
                                &times;
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
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context.addToast;
};