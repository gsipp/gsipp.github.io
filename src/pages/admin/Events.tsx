import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, MapPin, Loader2, Save, Clock, Link as LinkIcon, User as UserIcon, Users as UsersIcon, Info, Search, ChevronLeft } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Types
interface Member {
    id: string;
    nome: string;
    cargo: string;
}

interface Event {
    id: string;
    titulo: string;
    descricao: string;
    data_evento: string;
    local: string;
    horario: string;
    tipo: string;
    link_transmissao: string;
    link_certificado: string;
    duracao: string;
    palestrante_externo: string;
    data_evento_2: string;
    membro_estudante_id: string;
    membros_palestrantes_ids: string[];
    membros_orientadores_ids: string[];
}

const eventSchema = z.object({
    titulo: z.string().min(3, "Título é obrigatório"),
    descricao: z.string().optional().nullable(),
    data_evento: z.string().min(1, "Data é obrigatória"),
    local: z.string().optional().nullable(),
    horario: z.string().optional().nullable(),
    tipo: z.string().default('Evento'),
    link_transmissao: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
    link_certificado: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
    duracao: z.string().optional().nullable(),
    palestrante_externo: z.string().optional().nullable(),
    data_evento_2: z.string().optional().nullable(),
    membro_estudante_id: z.string().optional().nullable(),
    membros_palestrantes_ids: z.array(z.string()).default([]),
    membros_orientadores_ids: z.array(z.string()).default([])
});



const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const toast = useToast();

    const [memberSearch, setMemberSearch] = useState('');

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: { 
            tipo: 'Evento',
            membros_palestrantes_ids: [],
            membros_orientadores_ids: []
        }
    });

    const watchedTipo = watch('tipo');
    const watchedOrientadores = watch('membros_orientadores_ids');
    const watchedPalestrantes = watch('membros_palestrantes_ids');

    const getSafeDate = (dateString: string) => {
        if (!dateString) return new Date();
        const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    };

    const fetchData = async () => {
        setLoading(true);
        const [eventsRes, membersRes] = await Promise.all([
            supabase.from('eventos').select('*').order('data_evento', { ascending: true }),
            supabase.from('membros').select('id, nome, cargo').order('nome', { ascending: true })
        ]);

        if (eventsRes.error) console.error('Error fetching events:', eventsRes.error);
        else setEvents(eventsRes.data || []);

        if (membersRes.error) console.error('Error fetching members:', membersRes.error);
        else setMembers(membersRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredEvents = events.filter(e =>
        e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.local?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const filteredMembers = members.filter(m =>
        m.nome.toLowerCase().includes(memberSearch.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('eventos').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir evento: ' + (error as Error).message);
        else {
            setEvents(events.filter(e => e.id !== id));
            toast.success('Evento removido com sucesso.');
        }
    };

    const onSubmit = async (data: Record<string, unknown>) => {
        // Transform empty strings to null for text fields
        const payload = {
            ...data,
            link_transmissao: data.link_transmissao || null,
            link_certificado: data.link_certificado || null,
            membro_estudante_id: data.membro_estudante_id || null,
        };

        if (editingEvent) {
            const { error } = await supabase.from('eventos').update(payload).eq('id', editingEvent.id);
            if (error) toast.error('Erro ao atualizar: ' + (error as Error).message);
            else {
                toast.success('Evento atualizado com sucesso.');
                fetchData();
                setView('list');
            }
        } else {
            const { error } = await supabase.from('eventos').insert([payload]);
            if (error) toast.error('Erro ao criar evento: ' + (error as Error).message);
            else {
                toast.success('Evento agendado com sucesso.');
                fetchData();
                setView('list');
            }
        }
    };

    const openForm = (event?: Event) => {
        if (event) {
            setEditingEvent(event);
            reset({
                titulo: event.titulo,
                descricao: event.descricao,
                data_evento: event.data_evento ? event.data_evento.split('T')[0] : '',
                local: event.local,
                horario: event.horario,
                tipo: event.tipo || 'Evento',
                link_transmissao: event.link_transmissao,
                link_certificado: event.link_certificado,
                duracao: event.duracao,
                palestrante_externo: event.palestrante_externo,
                data_evento_2: event.data_evento_2 ? event.data_evento_2.split('T')[0] : '',
                membro_estudante_id: event.membro_estudante_id,
                membros_palestrantes_ids: event.membros_palestrantes_ids || [],
                membros_orientadores_ids: event.membros_orientadores_ids || []
            });
        } else {
            setEditingEvent(null);
            reset({
                tipo: 'Evento',
                data_evento: new Date().toISOString().split('T')[0],
                membros_palestrantes_ids: [],
                membros_orientadores_ids: []
            });
        }
        setView('form');
        setMemberSearch('');
    };

    const handleArraySelect = (field: 'membros_palestrantes_ids' | 'membros_orientadores_ids', id: string) => {
        const currentIds = (field === 'membros_orientadores_ids' ? watchedOrientadores : watchedPalestrantes) || [];
        if (currentIds.includes(id)) {
            setValue(field, currentIds.filter(i => i !== id));
        } else {
            setValue(field, [...currentIds, id]);
        }
    };

    const now = new Date(new Date().setHours(0, 0, 0, 0));
    const upcomingEvents = filteredEvents.filter(e => getSafeDate(e.data_evento) >= now);
    const pastEvents = filteredEvents.filter(e => getSafeDate(e.data_evento) < now);

    return (
        <div className="space-y-6">
            {view === 'list' ? (
                <>
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Agenda de Eventos</h1>
                            <p className="text-sm text-slate-500 mt-1">Defesas, palestras, workshops e eventos.</p>
                        </div>
                        <div className="flex w-full sm:w-auto gap-3">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar evento..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => openForm()}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" /> Novo Evento
                            </button>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                    <h2 className="text-sm font-semibold text-slate-900">Próximos Eventos</h2>
                                </div>
                                {upcomingEvents.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">Nenhum evento futuro agendado.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-white border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-3 font-medium text-slate-500 w-1/2">Evento</th>
                                                    <th className="px-6 py-3 font-medium text-slate-500">Data e Local</th>
                                                    <th className="px-6 py-3 font-medium text-slate-500">Tipo</th>
                                                    <th className="px-6 py-3 font-medium text-slate-500 text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {upcomingEvents.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-900 truncate max-w-sm">{item.titulo}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1 text-xs">
                                                                <span className="font-medium text-slate-700">
                                                                    {getSafeDate(item.data_evento).toLocaleDateString('pt-BR')} {item.horario?.slice(0, 5)}
                                                                </span>
                                                                <span className="text-slate-500 flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" /> {item.local || 'N/D'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                                {item.tipo}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => openForm(item)} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors" title="Editar">
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setConfirmDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Excluir">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    <h2 className="text-sm font-semibold text-slate-700">Histórico de Eventos</h2>
                                </div>
                                {pastEvents.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">Nenhum evento passado.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <tbody className="divide-y divide-slate-100">
                                                {pastEvents.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 w-1/2">
                                                            <div className="font-medium text-slate-600 truncate max-w-sm">{item.titulo}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs text-slate-500">
                                                                {getSafeDate(item.data_evento).toLocaleDateString('pt-BR')}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs text-slate-500">{item.tipo}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => openForm(item)} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors" title="Editar">
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setConfirmDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors" title="Excluir">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => setView('list')} className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{editingEvent ? 'Editar Atividade' : 'Nova Atividade'}</h2>
                            <p className="text-sm text-slate-500">Preencha os campos abaixo para atualizar a agenda.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col lg:flex-row">
                        {/* Formulário Principal */}
                        <div className="p-6 lg:w-2/3 space-y-6 lg:border-r border-slate-200">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título da Atividade *</label>
                                <input
                                    {...register('titulo')}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                    placeholder="Ex: Defesa de TCC - João Silva"
                                />
                                {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5" /> Tipo de Evento
                                    </label>
                                    <select
                                        {...register('tipo')}
                                        className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                    >
                                        <option value="Evento">Evento Geral</option>
                                        <option value="Defesa">Defesa de TCC</option>
                                        <option value="Palestra">Palestra</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Minicurso">Minicurso</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Local</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            {...register('local')}
                                            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                            placeholder="Auditório A / Meet"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Principal *</label>
                                    <input
                                        type="date"
                                        {...register('data_evento')}
                                        className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                    />
                                    {errors.data_evento && <p className="text-red-500 text-xs mt-1">{errors.data_evento.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Horário</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="time"
                                            {...register('horario')}
                                            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {watchedTipo === 'Defesa' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Segunda Data de Defesa (Opcional)</label>
                                    <input
                                        type="date"
                                        {...register('data_evento_2')}
                                        className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <textarea
                                    {...register('descricao')}
                                    rows={4}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm resize-y"
                                    placeholder="Detalhes sobre a pauta, palestrantes ou requisitos..."
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-slate-400" /> Links Úteis
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            {watchedTipo === 'Defesa' ? 'Link de Transmissão' : 'Link de Inscrição'}
                                        </label>
                                        <input
                                            type="url"
                                            {...register('link_transmissao')}
                                            className="w-full px-3 py-1.5 rounded border border-slate-300 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                                            placeholder="https://..."
                                        />
                                        {errors.link_transmissao && <p className="text-red-500 text-xs mt-1">{errors.link_transmissao.message}</p>}
                                    </div>
                                    {watchedTipo !== 'Defesa' && (
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Link do Certificado (UFC)</label>
                                            <input
                                                type="url"
                                                {...register('link_certificado')}
                                                className="w-full px-3 py-1.5 rounded border border-slate-300 text-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                                                placeholder="https://..."
                                            />
                                            {errors.link_certificado && <p className="text-red-500 text-xs mt-1">{errors.link_certificado.message}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Vínculos */}
                        <div className="p-6 lg:w-1/3 bg-slate-50 space-y-6 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                                        <UsersIcon className="w-4 h-4 text-slate-500" /> Vínculos
                                    </h3>
                                    <p className="text-xs text-slate-500">Associe membros a esta atividade.</p>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Filtrar membros..."
                                        value={memberSearch}
                                        onChange={e => setMemberSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-sm rounded border border-slate-300 bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                                    />
                                </div>

                                {watchedTipo === 'Defesa' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Estudante Responsável</label>
                                        <select
                                            {...register('membro_estudante_id')}
                                            className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-sm focus:border-slate-400 outline-none"
                                        >
                                            <option value="">Selecione...</option>
                                            {members.filter(m => m.cargo !== 'Docente' && m.nome.toLowerCase().includes(memberSearch.toLowerCase())).map(m => (
                                                <option key={m.id} value={m.id}>{m.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {watchedTipo === 'Defesa' ? (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Banca / Orientadores</label>
                                        <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-white border border-slate-200 rounded-md">
                                            {members.filter(m => m.cargo === 'Docente' && m.nome.toLowerCase().includes(memberSearch.toLowerCase())).map(m => (
                                                <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={watchedOrientadores?.includes(m.id)}
                                                        onChange={() => handleArraySelect('membros_orientadores_ids', m.id)}
                                                        className="rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                                                    />
                                                    <span className="text-xs text-slate-700">{m.nome}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Palestrantes (Membros)</label>
                                            <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-white border border-slate-200 rounded-md">
                                                {filteredMembers.map(m => (
                                                    <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={watchedPalestrantes?.includes(m.id)}
                                                            onChange={() => handleArraySelect('membros_palestrantes_ids', m.id)}
                                                            className="rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                                                        />
                                                        <span className="text-xs text-slate-700">{m.nome}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Painelista Externo</label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    {...register('palestrante_externo')}
                                                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded border border-slate-300 bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                                                    placeholder="Nome completo..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Tempo Estimado</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            {...register('duracao')}
                                            className="w-full pl-8 pr-3 py-1.5 text-sm rounded border border-slate-300 bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                                            placeholder="Ex: 1h 30min"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200 mt-6 space-y-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingEvent ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Cancelar e Voltar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
            
            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Remover evento"
                description="Tem certeza que deseja remover este evento? Esta ação não pode ser desfeita."
                onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default Events;
