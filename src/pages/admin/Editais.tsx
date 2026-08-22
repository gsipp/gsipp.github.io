import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, FileText, Loader2, Save, Calendar, ExternalLink, Activity, ChevronLeft, Search } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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

const editalSchema = z.object({
    titulo: z.string().min(3, "Título é obrigatório"),
    descricao: z.string().optional().nullable(),
    link_pdf: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
    data_abertura: z.string().min(1, "Data de abertura é obrigatória"),
    data_fechamento: z.string().min(1, "Data de fechamento é obrigatória"),
    status: z.string().default('Aberto'),
    ordem: z.number().int().default(0)
});



const Editais = () => {
    const [editais, setEditais] = useState<Edital[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingEdital, setEditingEdital] = useState<Edital | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const toast = useToast();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(editalSchema),
        defaultValues: { status: 'Aberto', ordem: 0 }
    });

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEditais();
    }, []);

    const filteredEditais = editais.filter(edital =>
        edital.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        edital.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('editais').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir edital: ' + (error as Error).message);
        else {
            setEditais(editais.filter(e => e.id !== id));
            toast.success('Edital removido com sucesso.');
        }
    };

    const onSubmit = async (data: Record<string, unknown>) => {
        const payload = {
            ...data,
            link_pdf: data.link_pdf || null,
            descricao: data.descricao || null,
        };

        if (editingEdital) {
            const { error } = await supabase.from('editais').update(payload).eq('id', editingEdital.id);
            if (error) toast.error('Erro ao atualizar: ' + (error as Error).message);
            else {
                toast.success('Edital atualizado com sucesso.');
                // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEditais();
                setView('list');
            }
        } else {
            const { error } = await supabase.from('editais').insert([payload]);
            if (error) toast.error('Erro ao criar edital: ' + (error as Error).message);
            else {
                toast.success('Edital criado com sucesso.');
                // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchEditais();
                setView('list');
            }
        }
    };

    const openForm = (edital?: Edital) => {
        if (edital) {
            setEditingEdital(edital);
            reset({
                titulo: edital.titulo,
                descricao: edital.descricao,
                link_pdf: edital.link_pdf,
                data_abertura: edital.data_abertura ? edital.data_abertura.split('T')[0] : '',
                data_fechamento: edital.data_fechamento ? edital.data_fechamento.split('T')[0] : '',
                status: edital.status || 'Aberto',
                ordem: edital.ordem || 0
            });
        } else {
            setEditingEdital(null);
            reset({
                status: 'Aberto',
                data_abertura: new Date().toISOString().split('T')[0],
                ordem: 0
            });
        }
        setView('form');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aberto': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Fechado': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'Em Análise': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            {view === 'list' ? (
                <>
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Editais</h1>
                            <p className="text-sm text-slate-500 mt-1">Gerencie chamadas e processos seletivos.</p>
                        </div>
                        <div className="flex w-full sm:w-auto gap-3">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar edital..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => openForm()}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" /> Novo Edital
                            </button>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                        </div>
                    ) : filteredEditais.length === 0 ? (
                        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum edital encontrado</h3>
                            <p className="text-slate-500">Adicione os editais do grupo de pesquisa.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-slate-500 w-1/2">Título e Descrição</th>
                                            <th className="px-6 py-3 font-medium text-slate-500">Período</th>
                                            <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                                            <th className="px-6 py-3 font-medium text-slate-500 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredEditais.map((edital) => (
                                            <tr key={edital.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 truncate max-w-sm mb-1">{edital.titulo}</div>
                                                    {edital.descricao && (
                                                        <div className="text-xs text-slate-500 truncate max-w-sm">{edital.descricao}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 text-xs">
                                                        <span className="flex items-center gap-1.5 text-emerald-700">
                                                            <Calendar className="w-3 h-3" /> Abre: {(() => {
                                                                if (!edital.data_abertura) return 'N/A';
                                                                const [year, month, day] = edital.data_abertura.split('T')[0].split('-').map(Number);
                                                                return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('pt-BR');
                                                            })()}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-rose-700">
                                                            <Calendar className="w-3 h-3" /> Fecha: {(() => {
                                                                if (!edital.data_fechamento) return 'N/A';
                                                                const [year, month, day] = edital.data_fechamento.split('T')[0].split('-').map(Number);
                                                                return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('pt-BR');
                                                            })()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(edital.status)}`}>
                                                        {edital.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {edital.link_pdf && (
                                                            <a href={edital.link_pdf} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors" title="Ver PDF">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <button onClick={() => openForm(edital)} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors" title="Editar">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setConfirmDelete(edital.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Remover">
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
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => setView('list')} className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{editingEdital ? 'Editar Edital' : 'Novo Edital'}</h2>
                            <p className="text-sm text-slate-500">Adicione os detalhes do edital.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Título do Edital *</label>
                            <input
                                {...register('titulo')}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                placeholder="Ex: Edital 01/2024 - Mestrado"
                            />
                            {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Abertura *</label>
                                <input
                                    type="date"
                                    {...register('data_abertura')}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                />
                                {errors.data_abertura && <p className="text-red-500 text-xs mt-1">{errors.data_abertura.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Fechamento *</label>
                                <input
                                    type="date"
                                    {...register('data_fechamento')}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                />
                                {errors.data_fechamento && <p className="text-red-500 text-xs mt-1">{errors.data_fechamento.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <div className="relative">
                                    <Activity className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <select
                                        {...register('status')}
                                        className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm bg-white"
                                    >
                                        <option value="Aberto">Aberto</option>
                                        <option value="Fechado">Fechado</option>
                                        <option value="Em Análise">Em Análise</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Link do PDF/Documento</label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input
                                        type="url"
                                        {...register('link_pdf')}
                                        className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                                {errors.link_pdf && <p className="text-red-500 text-xs mt-1">{errors.link_pdf.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Curta</label>
                            <textarea
                                {...register('descricao')}
                                rows={3}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm resize-y"
                                placeholder="Resumo dos objetivos do edital..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ordem de Exibição</label>
                            <input
                                type="number"
                                {...register('ordem', { valueAsNumber: true })}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
                                {editingEdital ? 'Salvar Alterações' : 'Criar Edital'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Remover edital"
                description="Tem certeza que deseja remover este edital? Esta ação não pode ser desfeita."
                onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default Editais;
