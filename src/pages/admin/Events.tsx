import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { Plus, Pencil, Trash2, MapPin, Loader2, Save, Clock, Calendar, Link as LinkIcon, User as UserIcon, GraduationCap, Presentation, Users as UsersIcon, Info, Search, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

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

const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState<Partial<Event>>({});
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Member search states
    const [memberSearch, setMemberSearch] = useState('');

    // Fetch data
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

    // Filter events for the list
    const filteredEvents = events.filter(event =>
        event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.local?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter members for selection
    const filteredMembers = members.filter(m =>
        m.nome.toLowerCase().includes(memberSearch.toLowerCase())
    );

    // Handle Delete
    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja remover este evento?')) return;
        const { error } = await supabase.from('eventos').delete().eq('id', id);
        if (error) alert('Erro ao deletar: ' + error.message);
        else setEvents(events.filter(e => e.id !== id));
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            titulo: formData.titulo,
            descricao: formData.descricao,
            data_evento: formData.data_evento,
            local: formData.local,
            horario: formData.horario,
            tipo: formData.tipo || 'Evento',
            link_transmissao: formData.link_transmissao,
            link_certificado: formData.link_certificado,
            duracao: formData.duracao,
            palestrante_externo: formData.palestrante_externo,
            data_evento_2: formData.data_evento_2,
            membro_estudante_id: formData.membro_estudante_id,
            membros_palestrantes_ids: formData.membros_palestrantes_ids || [],
            membros_orientadores_ids: formData.membros_orientadores_ids || []
        };

        if (editingEvent) {
            const { error } = await supabase.from('eventos').update(payload).eq('id', editingEvent.id);
            if (error) alert('Erro ao atualizar: ' + error.message);
        } else {
            const { error } = await supabase.from('eventos').insert([payload]);
            if (error) alert('Erro ao criar: ' + error.message);
        }

        setSaving(false);
        setView('list');
        setEditingEvent(null);
        setFormData({});
        fetchData();
    };

    const openForm = (event?: Event) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                ...event,
                data_evento: event.data_evento ? event.data_evento.split('T')[0] : '',
                data_evento_2: event.data_evento_2 ? event.data_evento_2.split('T')[0] : ''
            });
        } else {
            setEditingEvent(null);
            setFormData({
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
        const currentIds = formData[field] || [];
        if (currentIds.includes(id)) {
            setFormData({ ...formData, [field]: currentIds.filter(i => i !== id) });
        } else {
            setFormData({ ...formData, [field]: [...currentIds, id] });
        }
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'Defesa': return <GraduationCap className="w-4 h-4" />;
            case 'Palestra': return <Presentation className="w-4 h-4" />;
            case 'Workshop': return <UsersIcon className="w-4 h-4" />;
            default: return <Calendar className="w-4 h-4" />;
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto pb-20">
            {view === 'list' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Agenda de Eventos</h1>
                            <p className="text-gray-500">Defesas, palestras, workshops e eventos institucionais.</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar evento..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-full"
                                />
                            </div>
                            <button
                                onClick={() => openForm()}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/30 whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" /> <span className="hidden md:inline">Novo Evento</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Próximos Eventos */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-amber-500" />
                                    Cronograma de Atividades
                                </h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {filteredEvents
                                        .filter(e => {
                                            const eventDate = new Date(e.data_evento + 'T12:00:00');
                                            return eventDate >= new Date(new Date().setHours(0, 0, 0, 0));
                                        })
                                        .map((event) => (
                                            <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-6 group hover:shadow-md transition-all relative overflow-hidden">
                                                <div className={`absolute top-0 left-0 w-1 h-full ${event.tipo === 'Defesa' ? 'bg-blue-500' : event.tipo === 'Palestra' ? 'bg-purple-500' : 'bg-amber-500'}`}></div>
                                                <div className="flex-shrink-0 bg-slate-50 text-slate-600 w-20 h-20 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                                                    <span className="text-xs font-black uppercase tracking-tighter opacity-70">{new Date(event.data_evento + 'T12:00:00').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', month: 'short' })}</span>
                                                    <span className="text-3xl font-black leading-none">{new Date(event.data_evento + 'T12:00:00').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit' })}</span>
                                                    <span className="text-[10px] font-bold opacity-70">{new Date(event.data_evento + 'T12:00:00').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', year: 'numeric' })}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${event.tipo === 'Defesa' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            event.tipo === 'Palestra' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {getTipoIcon(event.tipo)}
                                                            {event.tipo}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-amber-600 transition-colors truncate">{event.titulo}</h3>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                            <span className="font-medium">{event.horario || '00:00'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                                                            <MapPin className="w-4 h-4 text-slate-400" />
                                                            <span className="font-medium truncate max-w-[150px]">{event.local || 'Online'}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{event.descricao}</p>
                                                </div>
                                                <div className="flex flex-col gap-2 justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button onClick={() => openForm(event)} className="p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-all shadow-sm" title="Editar">
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(event.id)} className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all shadow-sm" title="Remover">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    {filteredEvents.filter(e => new Date(e.data_evento) >= new Date(new Date().setHours(0, 0, 0, 0))).length === 0 && (
                                        <div className="col-span-full py-12 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">
                                            Nenhuma atividade agendada.
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Eventos Passados */}
                            <section>
                                <h2 className="text-xl font-bold text-gray-400 mb-6 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Histórico de Atividades
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredEvents
                                        .filter(e => {
                                            const eventDate = new Date(e.data_evento + 'T12:00:00');
                                            return eventDate < new Date(new Date().setHours(0, 0, 0, 0));
                                        })
                                        .map((event) => (
                                            <div key={event.id} className="bg-white px-5 py-4 rounded-xl border border-gray-100 flex items-center gap-4 group opacity-75 hover:opacity-100 transition-all shadow-sm">
                                                <div className="flex-shrink-0 bg-gray-100 text-gray-500 w-12 h-12 rounded-lg flex flex-col items-center justify-center border border-gray-200 text-center">
                                                    <span className="text-[10px] font-bold uppercase leading-none">{new Date(event.data_evento + 'T12:00:00').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', month: 'short' })}</span>
                                                    <span className="text-lg font-bold leading-none">{new Date(event.data_evento + 'T12:00:00').toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit' })}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-700 text-sm truncate">{event.titulo}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-400 font-medium">{new Date(event.data_evento + 'T12:00:00').toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                                                        <span className="text-[10px] text-slate-300">•</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{event.tipo}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openForm(event)} className="p-1.5 hover:bg-slate-50 text-gray-400 hover:text-slate-600 rounded-lg transition-colors">
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(event.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </section>
                        </div>
                    )}
                </>
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setView('list')} className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{editingEvent ? 'Editar Atividade' : 'Nova Atividade'}</h2>
                            <p className="text-gray-500">Preencha os campos abaixo para atualizar a agenda.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Título da Atividade</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.titulo || ''}
                                            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-xl"
                                            placeholder="Ex: Defesa de TCC - João Silva"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Info className="w-4 h-4 text-blue-500" /> Tipo de Evento
                                            </label>
                                            <select
                                                value={formData.tipo || 'Evento'}
                                                onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all bg-white"
                                            >
                                                <option value="Evento">Evento Geral</option>
                                                <option value="Defesa">Defesa de TCC</option>
                                                <option value="Palestra">Palestra</option>
                                                <option value="Workshop">Workshop</option>
                                                <option value="Minicurso">Minicurso</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Local</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={formData.local || ''}
                                                    onChange={e => setFormData({ ...formData, local: e.target.value })}
                                                    className="w-full pl-12 pr-5 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                                                    placeholder="Auditório A / Meet"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Data Principal</label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.data_evento || ''}
                                                onChange={e => setFormData({ ...formData, data_evento: e.target.value })}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="time"
                                                    value={formData.horario || ''}
                                                    onChange={e => setFormData({ ...formData, horario: e.target.value })}
                                                    className="w-full pl-12 pr-5 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {formData.tipo === 'Defesa' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 font-bold text-amber-600">Segunda Data de Defesa (Opcional)</label>
                                            <input
                                                type="date"
                                                value={formData.data_evento_2 || ''}
                                                onChange={e => setFormData({ ...formData, data_evento_2: e.target.value })}
                                                className="w-full px-5 py-3 rounded-xl border border-amber-100 bg-amber-50/30 text-gray-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Descrição da Atividade</label>
                                        <textarea
                                            rows={6}
                                            value={formData.descricao || ''}
                                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all resize-none leading-relaxed"
                                            placeholder="Detalhes sobre a pauta, palestrantes ou requisitos..."
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                            <LinkIcon className="w-5 h-5 text-gray-400" /> Links Úteis
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{formData.tipo === 'Defesa' ? 'Link de Transmissão' : 'Link de Inscrição'}</label>
                                                <input
                                                    type="url"
                                                    value={formData.link_transmissao || ''}
                                                    onChange={e => setFormData({ ...formData, link_transmissao: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            {formData.tipo !== 'Defesa' && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Link do Certificado (UFC)</label>
                                                    <input
                                                        type="url"
                                                        value={formData.link_certificado || ''}
                                                        onChange={e => setFormData({ ...formData, link_certificado: e.target.value })}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar: Member Selection */}
                            <div className="space-y-6">
                                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-8 sticky top-8">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                            <UsersIcon className="w-5 h-5 text-amber-500" /> Vínculos
                                        </h3>
                                        <p className="text-slate-400 text-sm italic">Associe membros do laboratório a esta atividade.</p>
                                    </div>

                                    {/* Sub-search for members */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Filtrar membros..."
                                            value={memberSearch}
                                            onChange={e => setMemberSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>

                                    {formData.tipo === 'Defesa' && (
                                        <div className="space-y-4">
                                            <label className="block text-xs font-black text-amber-500 uppercase tracking-widest">Estudante Responsável</label>
                                            <select
                                                value={formData.membro_estudante_id || ''}
                                                onChange={e => setFormData({ ...formData, membro_estudante_id: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            >
                                                <option value="">Selecione o estudante...</option>
                                                {members.filter(m => m.cargo !== 'Docente' && m.nome.toLowerCase().includes(memberSearch.toLowerCase())).map(m => (
                                                    <option key={m.id} value={m.id}>{m.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.tipo === 'Defesa' ? (
                                        <div className="space-y-4">
                                            <label className="block text-xs font-black text-amber-500 uppercase tracking-widest">Banca / Orientadores</label>
                                            <div className="max-h-60 overflow-y-auto space-y-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700 scrollbar-thin scrollbar-thumb-slate-700">
                                                {members.filter(m => m.cargo === 'Docente' && m.nome.toLowerCase().includes(memberSearch.toLowerCase())).map(m => (
                                                    <label key={m.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${(formData.membros_orientadores_ids || []).includes(m.id) ? 'bg-blue-500/20 text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={(formData.membros_orientadores_ids || []).includes(m.id)}
                                                            onChange={() => handleArraySelect('membros_orientadores_ids', m.id)}
                                                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                                        />
                                                        <span className="text-xs font-medium">{m.nome}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="block text-xs font-black text-amber-500 uppercase tracking-widest">Palestrantes (Membros)</label>
                                                <div className="max-h-60 overflow-y-auto space-y-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700 scrollbar-thin scrollbar-thumb-slate-700">
                                                    {filteredMembers.map(m => (
                                                        <label key={m.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${(formData.membros_palestrantes_ids || []).includes(m.id) ? 'bg-purple-500/20 text-white' : 'hover:bg-slate-700/50 text-slate-300'}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={(formData.membros_palestrantes_ids || []).includes(m.id)}
                                                                onChange={() => handleArraySelect('membros_palestrantes_ids', m.id)}
                                                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                                                            />
                                                            <span className="text-xs font-medium">{m.nome}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-xs font-black text-amber-500 uppercase tracking-widest">Painelista Externo</label>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        value={formData.palestrante_externo || ''}
                                                        onChange={e => setFormData({ ...formData, palestrante_externo: e.target.value })}
                                                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                                        placeholder="Nome completo..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4 border-t border-slate-800">
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Tempo Estimado</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                value={formData.duracao || ''}
                                                onChange={e => setFormData({ ...formData, duracao: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                                placeholder="Ex: 1h 30min"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-500/30 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                            {editingEvent ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR AGENDAMENTO'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setView('list')}
                                            className="w-full mt-4 text-slate-400 hover:text-white text-sm font-bold transition-colors"
                                        >
                                            CANCELAR E VOLTAR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}
        </div>
    );
};

export default Events;
