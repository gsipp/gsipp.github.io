import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, Archive, Loader2, Save, ExternalLink, Search, FileText, ChevronLeft } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { Link } from 'react-router-dom';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

const publicationSchema = z.object({
    titulo: z.string().min(3, "Título é obrigatório"),
    autores: z.string().min(3, "Autores são obrigatórios"),
    ano: z.number().int().min(1900, "Ano inválido").max(new Date().getFullYear() + 5, "Ano inválido"),
    tipo: z.string().default('Artigo'),
    veiculo: z.string().optional().nullable(),
    orientador: z.string().optional().nullable(),
    co_orientador: z.string().optional().nullable(),
    link_doi: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
    link_pdf: z.string().url("URL inválida").optional().or(z.literal('')).nullable()
});



const Publications = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingPub, setEditingPub] = useState<Publication | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const toast = useToast();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(publicationSchema),
        defaultValues: { ano: new Date().getFullYear(), tipo: 'Artigo' }
    });

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPublications();
    }, []);

    const filteredPublications = publications.filter(pub =>
        (pub.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (pub.autores?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('publicacoes').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir publicação: ' + (error as Error).message);
        else {
            setPublications(publications.filter(p => p.id !== id));
            toast.success('Publicação removida com sucesso.');
        }
    };

    const onSubmit = async (data: Record<string, unknown>) => {
        const payload = {
            ...data,
            veiculo: data.veiculo || null,
            orientador: data.orientador || null,
            co_orientador: data.co_orientador || null,
            link_doi: data.link_doi || null,
            link_pdf: data.link_pdf || null,
        };

        if (editingPub) {
            const { error } = await supabase.from('publicacoes').update(payload).eq('id', editingPub.id);
            if (error) toast.error('Erro ao atualizar: ' + (error as Error).message);
            else {
                toast.success('Publicação atualizada com sucesso.');
                // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPublications();
                setView('list');
            }
        } else {
            const { error } = await supabase.from('publicacoes').insert([payload]);
            if (error) toast.error('Erro ao adicionar publicação: ' + (error as Error).message);
            else {
                toast.success('Publicação adicionada com sucesso.');
                // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPublications();
                setView('list');
            }
        }
    };

    const openForm = (pub?: Publication) => {
        if (pub) {
            setEditingPub(pub);
            reset({
                titulo: pub.titulo,
                autores: pub.autores,
                ano: pub.ano,
                tipo: pub.tipo || 'Artigo',
                veiculo: pub.veiculo,
                orientador: pub.orientador,
                co_orientador: pub.co_orientador,
                link_doi: pub.link_doi,
                link_pdf: pub.link_pdf
            });
        } else {
            setEditingPub(null);
            reset({ ano: new Date().getFullYear(), tipo: 'Artigo' });
        }
        setView('form');
    };

    return (
        <div className="space-y-6">
            {view === 'list' ? (
                <>
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Publicações</h1>
                            <p className="text-sm text-slate-500 mt-1">Gerencie o acervo de produção científica.</p>
                        </div>
                        <div className="flex w-full sm:w-auto gap-3">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar publicação..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
                                />
                            </div>
                            <Link
                                to="/gestao-gsipp/publicacoes/importar"
                                title="Importar do ORCID"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 md:px-4 md:py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Archive className="w-4 h-4" /> <span className="hidden md:inline">Importar via ORCID</span>
                            </Link>
                            <button
                                onClick={() => openForm()}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" /> Nova Publicação
                            </button>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                        </div>
                    ) : filteredPublications.length === 0 ? (
                        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhuma publicação encontrada</h3>
                            <p className="text-slate-500">Adicione manualmente ou importe do ORCID.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-slate-500 w-16">Ano</th>
                                            <th className="px-6 py-3 font-medium text-slate-500 w-1/2">Título e Autores</th>
                                            <th className="px-6 py-3 font-medium text-slate-500">Veículo / Tipo</th>
                                            <th className="px-6 py-3 font-medium text-slate-500 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredPublications.map((pub) => (
                                            <tr key={pub.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-slate-700">{pub.ano}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 truncate max-w-lg mb-1" title={pub.titulo}>{pub.titulo}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-lg" title={pub.autores}>{pub.autores}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                            {pub.tipo}
                                                        </span>
                                                        {pub.veiculo && (
                                                            <span className="text-xs text-slate-500 truncate max-w-[200px]" title={pub.veiculo}>
                                                                {pub.veiculo}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {pub.link_doi && (
                                                            <a href={pub.link_doi} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors" title="Abrir DOI">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        {pub.link_pdf && (
                                                            <a href={pub.link_pdf} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors" title="Ver PDF">
                                                                <FileText className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <button onClick={() => openForm(pub)} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors" title="Editar">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setConfirmDelete(pub.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Excluir">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{editingPub ? 'Editar Publicação' : 'Nova Publicação'}</h2>
                                <p className="text-sm text-slate-500">Adicione os detalhes da obra.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                            <input
                                {...register('titulo')}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                            />
                            {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Autores *</label>
                            <input
                                {...register('autores')}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                placeholder="Ex: Silva, J.; Santos, A."
                            />
                            {errors.autores && <p className="text-red-500 text-xs mt-1">{errors.autores.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ano *</label>
                                <input
                                    type="number"
                                    {...register('ano', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                />
                                {errors.ano && <p className="text-red-500 text-xs mt-1">{errors.ano.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                <select
                                    {...register('tipo')}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm bg-white"
                                >
                                    <option>Artigo em Periódico</option>
                                    <option>Artigo em Conferência</option>
                                    <option>Artigo</option>
                                    <option>Tese</option>
                                    <option>Dissertação</option>
                                    <option>Livro</option>
                                    <option>Capítulo de Livro</option>
                                    <option>Outro</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Veículo (Revista / Conferência)</label>
                            <input
                                {...register('veiculo')}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                placeholder="Ex: IEEE Security & Privacy"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Orientador</label>
                                <input
                                    {...register('orientador')}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                    placeholder="Nome do Orientador"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Co-orientador</label>
                                <input
                                    {...register('co_orientador')}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                    placeholder="Nome do Co-orientador"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Link DOI</label>
                                <input
                                    type="url"
                                    {...register('link_doi')}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                    placeholder="https://doi.org/..."
                                />
                                {errors.link_doi && <p className="text-red-500 text-xs mt-1">{errors.link_doi.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Link PDF</label>
                                <input
                                    type="url"
                                    {...register('link_pdf')}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                    placeholder="https://..."
                                />
                                {errors.link_pdf && <p className="text-red-500 text-xs mt-1">{errors.link_pdf.message}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="px-4 py-2 rounded-md text-slate-700 font-medium hover:bg-slate-100 transition-colors text-sm border border-transparent hover:border-slate-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editingPub ? 'Salvar Alterações' : 'Adicionar Publicação'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Remover publicação"
                description="Tem certeza que deseja remover esta publicação? Esta ação não pode ser desfeita."
                onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default Publications;
