import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({
    isOpen,
    title,
    description,
    confirmLabel = 'Excluir',
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onCancel}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 10 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
                                </div>
                                <button
                                    onClick={onCancel}
                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex justify-end gap-3">
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => { onConfirm(); onCancel(); }}
                                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
