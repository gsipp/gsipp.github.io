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
        cpf: '',
        curso: 'Ciência da Computação',
        matricula: '',
        titulo_projeto: '',
        funcao: 'Bolsista de Iniciação Científica',
        orgao_fomento: 'FUNCAP',
        orientador: 'Antonio Emerson Barros Tomaz',
        carga_horaria: '12',
        total_horas: '',
        data_inicio: '',
        data_fim: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">Gerar Declaração de Projeto</h2>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Nome do Aluno(a)</label>
                                    <input required type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">CPF</label>
                                    <input required type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Curso</label>
                                    <input required type="text" name="curso" value={formData.curso} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Matrícula</label>
                                    <input required type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Título do Projeto de Pesquisa</label>
                                <input required type="text" name="titulo_projeto" value={formData.titulo_projeto} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Função (Ex: Bolsista, Voluntário)</label>
                                    <input required type="text" name="funcao" value={formData.funcao} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Órgão de Fomento (Opcional)</label>
                                    <input type="text" name="orgao_fomento" value={formData.orgao_fomento} onChange={handleChange} placeholder="Ex: FUNCAP, CNPq" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Orientador</label>
                                <input required type="text" name="orientador" value={formData.orientador} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Horas/Semana</label>
                                    <input required type="number" name="carga_horaria" value={formData.carga_horaria} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Total de Horas</label>
                                    <input required type="number" name="total_horas" value={formData.total_horas} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Data Início</label>
                                    <input required type="date" name="data_inicio" value={formData.data_inicio} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Data Fim</label>
                                    <input required type="date" name="data_fim" value={formData.data_fim} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
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
