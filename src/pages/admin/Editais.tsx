import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { Plus, Pencil, Trash2, X, FileText, Loader2, Save, Calendar, ExternalLink, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Edital {
    id: string;
    titulo: string;
    descricao: string;
    link_pdf: string;
    data_abertura: string;
    data_fechamento: string;
    status: string;
    ordem: number;
}

const Editais = () => {
    const [editais, setEditais] = useState<Edital[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEdital, setEditingEdital] = useState<Edital | null>(null);
    const [formData, setFormData] = useState<Partial<Edital>>({});
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch editais
    const fetchEditais = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('editais')
            .select('*')
            .order('ordem', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching editais:', error);
        else setEditais(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchEditais();
    }, []);

    // Filter editais
    const filteredEditais = editais.filter(edital =>
        edital.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        edital.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Delete
    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja remover este edital?')) return;
        const { error } = await supabase.from('editais').delete().eq('id', id);
        if (error) alert('Erro ao deletar: ' + error.message);
        else setEditais(editais.filter(e => e.id !== id));
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            titulo: formData.titulo,
            descricao: formData.descricao,
            link_pdf: formData.link_pdf,
            data_abertura: formData.data_abertura,
            data_fechamento: formData.data_fechamento,
            status: formData.status || 'Aberto',
            ordem: formData.ordem || 0
        };

        if (editingEdital) {
            const { error } = await supabase.from('editais').update(payload).eq('id', editingEdital.id);
            if (error) alert('Erro ao atualizar: ' + error.message);
        } else {
            const { error } = await supabase.from('editais').insert([payload]);
            if (error) alert('Erro ao criar: ' + error.message);
        }

        setSaving(false);
        setIsModalOpen(false);
        setEditingEdital(null);
        setFormData({});
        fetchEditais();
    };

    const openModal = (edital?: Edital) => {
        if (edital) {
            setEditingEdital(edital);
            const dataAbertura = edital.data_abertura ? edital.data_abertura.split('T')[0] : '';
            const dataFechamento = edital.data_fechamento ? edital.data_fechamento.split('T')[0] : '';
            setFormData({
                ...edital,
                data_abertura: dataAbertura,
                data_fechamento: dataFechamento
            });
        } else {
            setEditingEdital(null);
            setFormData({
                status: 'Aberto',
                data_abertura: new Date().toISOString().split('T')[0],
                ordem: 0
            });
        }
        setIsModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aberto': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Fechado': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Em Análise': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Editais</h1>
                    <p className="text-gray-500">Gerencie chamadas e processos seletivos.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar edital..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full md:w-64"
                    />
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/30 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> <span className="hidden md:inline">Novo Edital</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredEditais.map((edital) => (
                        <div key={edital.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6">
                            <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                                <FileText className="w-6 h-6" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-gray-900 text-lg truncate">{edital.titulo}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(edital.status)}`}>
                                        {edital.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Abre: {(() => {
                                            if (!edital.data_abertura) return 'N/A';
                                            const [year, month, day] = edital.data_abertura.split('T')[0].split('-').map(Number);
                                            return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                                        })()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Fecha: {(() => {
                                            if (!edital.data_fechamento) return 'N/A';
                                            const [year, month, day] = edital.data_fechamento.split('T')[0].split('-').map(Number);
                                            return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                                        })()}</span>
                                    </div>
                                    {edital.link_pdf && (
                                        <a href={edital.link_pdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium">
                                            <ExternalLink className="w-4 h-4" />
                                            Ver PDF
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <button onClick={() => openModal(edital)} className="p-2.5 hover:bg-slate-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-colors" title="Editar">
                                    <Pencil className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(edital.id)} className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors" title="Remover">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredEditais.length === 0 && (
                        <div className="py-16 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">
                            Nenhum edital encontrado.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-900">{editingEdital ? 'Editar Edital' : 'Novo Edital'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Edital</label>
                                    <input type="text" required value={formData.titulo || ''} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Ex: Edital 01/2024 - Mestrado em Ciência da Computação" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Abertura</label>
                                        <input type="date" required value={formData.data_abertura || ''} onChange={e => setFormData({ ...formData, data_abertura: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fechamento</label>
                                        <input type="date" required value={formData.data_fechamento || ''} onChange={e => setFormData({ ...formData, data_fechamento: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <div className="relative">
                                            <Activity className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <select
                                                value={formData.status || 'Aberto'}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none bg-white"
                                            >
                                                <option value="Aberto">Aberto</option>
                                                <option value="Fechado">Fechado</option>
                                                <option value="Em Análise">Em Análise</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link do PDF/Documento</label>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input type="url" value={formData.link_pdf || ''} onChange={e => setFormData({ ...formData, link_pdf: e.target.value })} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="https://..." />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Curta</label>
                                    <textarea rows={3} value={formData.descricao || ''} onChange={e => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none" placeholder="Resumo dos objetivos do edital..." />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordem de Exibição</label>
                                    <input type="number" value={formData.ordem || 0} onChange={e => setFormData({ ...formData, ordem: parseInt(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70">
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editingEdital ? 'Salvar Alterações' : 'Criar Edital'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Editais;
