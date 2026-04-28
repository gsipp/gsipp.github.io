import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    success: () => {},
    error: () => {},
    warning: () => {},
});

export const useToast = () => useContext(ToastContext);

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
};

const styles = {
    success: 'bg-blue-50 border-blue-200 text-blue-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

const iconStyles = {
    success: 'text-blue-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => dismiss(id), 5000);
    }, [dismiss]);

    const value = {
        success: (msg: string) => addToast(msg, 'success'),
        error: (msg: string) => addToast(msg, 'error'),
        warning: (msg: string) => addToast(msg, 'warning'),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] space-y-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => {
                        const Icon = icons[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl max-w-sm ${styles[toast.type]}`}
                            >
                                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconStyles[toast.type]}`} />
                                <p className="text-sm font-medium flex-1 leading-relaxed">{toast.message}</p>
                                <button
                                    onClick={() => dismiss(toast.id)}
                                    className="p-0.5 rounded-full hover:bg-black/10 transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
