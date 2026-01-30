import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { Plus, Pencil, Trash2, X, Archive, Loader2, Save, FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Publication {
    id: string;
    titulo: string;
    autores: string;
    ano: number;
    link_url: string;
    tipo: string; // Artigo, Tese, Dissertação, etc.
}

const Publications = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPub, setEditingPub] = useState<Publication | null>(null);
    const [formData, setFormData] = useState<Partial<Publication>>({});
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch publications
    const fetchPublications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('publicacoes')
            .select('*')
            .order('ano', { ascending: false });

        if (error) console.error('Error fetching publications:', error);
        else setPublications(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchPublications();
    }, []);

    // Filter publications
    const filteredNotifications = publications.filter(pub =>
        pub.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.autores.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Delete
    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja remover esta publicação?')) return;
        const { error } = await supabase.from('publicacoes').delete().eq('id', id);
        if (error) alert('Erro ao deletar: ' + error.message);
        else setPublications(publications.filter(p => p.id !== id));
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            titulo: formData.titulo,
            autores: formData.autores,
            ano: formData.ano,
            link_url: formData.link_url,
            tipo: formData.tipo
        };

        if (editingPub) {
            const { error } = await supabase.from('publicacoes').update(payload).eq('id', editingPub.id);
            if (error) alert('Erro ao atualizar: ' + error.message);
        } else {
            const { error } = await supabase.from('publicacoes').insert([payload]);
            if (error) alert('Erro ao criar: ' + error.message);
        }

        setSaving(false);
        setIsModalOpen(false);
        setEditingPub(null);
        setFormData({});
        fetchPublications();
    };

    const openModal = (pub?: Publication) => {
        if (pub) {
            setEditingPub(pub);
            setFormData(pub);
        } else {
            setEditingPub(null);
            setFormData({ ano: new Date().getFullYear(), tipo: 'Artigo' });
        }
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Publicações</h1>
                    <p className="text-gray-500">Gerencie o acervo de produção científica.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar publicação..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full md:w-64"
                    />
                    <button
                        onClick={() => openModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> <span className="hidden md:inline">Nova Publicação</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col divide-y divide-gray-100">
                    {filteredNotifications.map((pub) => (
                        <div key={pub.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                            <div className="flex items-start gap-4">
                                <div className="hidden md:flex w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-emerald-700 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                            {pub.ano}
                                        </span>
                                        <span className="text-gray-400 text-xs uppercase font-semibold tracking-wider border border-gray-200 px-2 py-0.5 rounded-md">
                                            {pub.tipo}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                                        <a href={pub.link_url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors flex items-center gap-2">
                                            {pub.titulo}
                                            <ExternalLink className="w-4 h-4 text-gray-400" />
                                        </a>
                                    </h3>
                                    <p className="text-gray-500 text-sm">{pub.autores}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-center">
                                <button onClick={() => openModal(pub)} className="p-2 hover:bg-white text-gray-400 hover:text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-gray-200 shadow-sm">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(pub.id)} className="p-2 hover:bg-white text-gray-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-gray-200 shadow-sm">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredNotifications.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            <Archive className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                            <p>Nenhuma publicação encontrada.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-900">{editingPub ? 'Editar Publicação' : 'Nova Publicação'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                    <input type="text" required value={formData.titulo || ''} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Autores</label>
                                    <input type="text" required value={formData.autores || ''} onChange={e => setFormData({ ...formData, autores: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ex: Silva, J.; Santos, A." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                                        <input type="number" required value={formData.ano || 2024} onChange={e => setFormData({ ...formData, ano: parseInt(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <select value={formData.tipo || 'Artigo'} onChange={e => setFormData({ ...formData, tipo: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                                            <option>Artigo</option>
                                            <option>Tese</option>
                                            <option>Dissertação</option>
                                            <option>Capítulo de Livro</option>
                                            <option>Outro</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link (URL)</label>
                                    <input type="url" value={formData.link_url || ''} onChange={e => setFormData({ ...formData, link_url: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="https://..." />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-70">
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editingPub ? 'Salvar' : 'Adicionar'}
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

export default Publications;
