import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText } from 'lucide-react';
import { generateDeclarationProjectHTML } from '../../utils/DeclarationTemplate';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function GerarDeclaracaoProjetoModal({ isOpen, onClose }: Props) {
    const [formData, setFormData] = useState({
        nome: '',
        tipo_participante: 'a discente',
        periodo_participacao: '2024.1 a 2025.1',
        titulo_projeto: '',
        coordenador: 'Dr. Antonio Emerson Barros Tomaz',
        paragrafo_detalhes: 'O projeto teve início em 2024.1 e encontra-se em andamento, cujo principal objetivo é...'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const html = generateDeclarationProjectHTML(formData, {});
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        } else {
            alert('Por favor, permita popups neste site.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl relative z-10 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Declaração de Projeto de Pesquisa</h2>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1 sm:col-span-1">
                                    <label className="text-sm font-medium text-slate-700">Artigo/Título</label>
                                    <select name="tipo_participante" value={formData.tipo_participante} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                                        <option value="a discente">a discente</option>
                                        <option value="o discente">o discente</option>
                                        <option value="a pesquisadora">a pesquisadora</option>
                                        <option value="o pesquisador">o pesquisador</option>
                                    </select>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                                    <input required type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Maria Fernanda Ferreira Paulino" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Título do Projeto</label>
                                <input required type="text" name="titulo_projeto" value={formData.titulo_projeto} onChange={handleChange} placeholder="Ex: Proteção de Sensores de Trânsito..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Período de Participação</label>
                                    <input required type="text" name="periodo_participacao" value={formData.periodo_participacao} onChange={handleChange} placeholder="Ex: 2024.1 a 2025.1" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Coordenador</label>
                                    <input required type="text" name="coordenador" value={formData.coordenador} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">2º Parágrafo (Detalhes do Projeto)</label>
                                <textarea 
                                    required 
                                    name="paragrafo_detalhes" 
                                    value={formData.paragrafo_detalhes} 
                                    onChange={handleChange} 
                                    rows={4}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                <p className="text-xs text-slate-500">Este texto aparecerá logo abaixo do parágrafo principal. Descreva o andamento, objetivos ou resumo do projeto.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                                    Cancelar
                                </button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 cursor-pointer">
                                    <FileText className="w-4 h-4" /> Gerar PDF
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
