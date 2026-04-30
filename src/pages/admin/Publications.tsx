import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, X, Archive, Loader2, Save, FileText, ExternalLink, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';
import OrcidImporter from '../../components/admin/OrcidImporter';

// Types
interface Publication {
    id: string;
    titulo: string;
    autores: string;
    ano: number;
    link_doi: string;
    link_pdf: string;
    veiculo: string;
    tipo: string;
    orientador?: string;
    co_orientador?: string;
}

const Publications = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPub, setEditingPub] = useState<Publication | null>(null);
    const [formData, setFormData] = useState<Partial<Publication>>({});
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [isOrcidModalOpen, setIsOrcidModalOpen] = useState(false);
    const toast = useToast();

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
        (pub.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (pub.autores?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Handle Delete
    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('publicacoes').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir publicação: ' + error.message);
        else {
            setPublications(publications.filter(p => p.id !== id));
            toast.success('Publicação removida com sucesso.');
        }
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            titulo: formData.titulo,
            autores: formData.autores,
            ano: formData.ano,
            link_doi: formData.link_doi,
            link_pdf: formData.link_pdf,
            veiculo: formData.veiculo,
            tipo: formData.tipo,
            orientador: formData.orientador || '',
            co_orientador: formData.co_orientador || ''
        };

        if (editingPub) {
            const { error } = await supabase.from('publicacoes').update(payload).eq('id', editingPub.id);
            if (error) toast.error('Erro ao atualizar: ' + error.message);
            else toast.success('Publicação atualizada com sucesso.');
        } else {
            const { error } = await supabase.from('publicacoes').insert([payload]);
            if (error) toast.error('Erro ao adicionar publicação: ' + error.message);
            else toast.success('Publicação adicionada com sucesso.');
        }

        setSaving(false);
        setIsModalOpen(false);
        setEditingPub(null);
        setFormData({});
        fetchPublications();
    };

    // Handle ORCID Import
    const handleOrcidImport = async (selectedWorks: any[]) => {
        setIsOrcidModalOpen(false);
        setLoading(true);

        const { error } = await supabase.from('publicacoes').insert(selectedWorks);

        if (error) {
            toast.error('Erro ao salvar publicações importadas: ' + error.message);
        } else {
            toast.success(`${selectedWorks.length} publicações importadas com sucesso!`);
            fetchPublications();
        }
        setLoading(false);
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
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar publicação..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full bg-white"
                        />
                    </div>
                    <button
                        onClick={() => setIsOrcidModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap"
                        title="Importar Publicação"
                    >
                        <Archive className="w-5 h-5" /> <span className="hidden md:inline">Importar via ORCID</span>
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> <span className="hidden md:inline">Nova Publicação</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredNotifications.map((pub) => {
                        const typeColors: Record<string, string> = {
                            'Artigo em Periódico': 'bg-blue-500',
                            'Artigo em Conferência': 'bg-violet-500',
                            'Artigo': 'bg-blue-500',
                            'Tese': 'bg-amber-500',
                            'Dissertação': 'bg-orange-500',
                            'Livro': 'bg-emerald-500',
                            'Capítulo de Livro': 'bg-teal-500',
                            'Preprint': 'bg-pink-500',
                            'TCC': 'bg-emerald-500',
                        };
                        const barColor = typeColors[pub.tipo] || 'bg-slate-400';

                        return (
                            <div key={pub.id} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all flex">
                                {/* Barra lateral colorida por tipo */}
                                <div className={`w-1.5 shrink-0 ${barColor}`} />

                                <div className="flex-1 p-5 flex flex-col md:flex-row gap-4 md:items-center">
                                    {/* Número do ano em destaque */}
                                    <div className="hidden md:flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-xl shrink-0 border border-slate-100">
                                        <span className="text-lg font-black text-slate-800 leading-none">{pub.ano}</span>
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Ano</span>
                                    </div>

                                    {/* Conteúdo principal */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="md:hidden text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{pub.ano}</span>
                                            {pub.tipo && (
                                                <span className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full ${barColor}`}>
                                                    {pub.tipo}
                                                </span>
                                            )}
                                            {pub.veiculo && (
                                                <span className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full truncate max-w-[200px]">{pub.veiculo}</span>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-slate-900 text-base leading-snug mb-1.5 line-clamp-2">
                                            {pub.titulo}
                                        </h3>

                                        <p className="text-slate-400 text-sm truncate">{pub.autores}</p>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                                        {pub.link_doi && (
                                            <a
                                                href={pub.link_doi}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Abrir DOI"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        {pub.link_pdf && (
                                            <a
                                                href={pub.link_pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                title="Ver PDF"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button onClick={() => openModal(pub)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setConfirmDelete(pub.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Excluir">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
                                    <input type="text" required value={formData.titulo || ''} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Autores</label>
                                    <input type="text" required value={formData.autores || ''} onChange={e => setFormData({ ...formData, autores: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Silva, J.; Santos, A." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                                        <input type="number" required value={formData.ano || 2024} onChange={e => setFormData({ ...formData, ano: parseInt(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <select value={formData.tipo || 'Artigo'} onChange={e => setFormData({ ...formData, tipo: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                                            <option>Artigo em Periódico</option>
                                            <option>Artigo em Conferência</option>
                                            <option>Tese</option>
                                            <option>Dissertação</option>
                                            <option>Livro</option>
                                            <option>Capítulo de Livro</option>
                                            <option>Outro</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Veículo (Revista / Conferência)</label>
                                    <input type="text" value={formData.veiculo || ''} onChange={e => setFormData({ ...formData, veiculo: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Ex: IEEE Security & Privacy" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Orientador</label>
                                        <input type="text" value={formData.orientador || ''} onChange={e => setFormData({ ...formData, orientador: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Nome do Orientador" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Co-orientador</label>
                                        <input type="text" value={formData.co_orientador || ''} onChange={e => setFormData({ ...formData, co_orientador: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Nome do Co-orientador" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link DOI</label>
                                        <input type="url" value={formData.link_doi || ''} onChange={e => setFormData({ ...formData, link_doi: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="https://doi.org/..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link PDF</label>
                                        <input type="url" value={formData.link_pdf || ''} onChange={e => setFormData({ ...formData, link_pdf: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-70">
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editingPub ? 'Salvar' : 'Adicionar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Remover publicação"
                description="Tem certeza que deseja remover esta publicação? Esta ação não pode ser desfeita."
                onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />

            {/* Orcid Importer Modal */}
            <AnimatePresence>
                {isOrcidModalOpen && (
                    <OrcidImporter
                        onImport={handleOrcidImport}
                        onClose={() => setIsOrcidModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Publications;
