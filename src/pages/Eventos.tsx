import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ChevronRight, GraduationCap, Presentation, Users as UsersIcon, Download } from 'lucide-react';

interface Event {
    id: string;
    titulo: string;
    data_evento: string;
    local: string;
    descricao: string;
    link_transmissao: string;
    link_certificado: string;
    imagem_url: string;
    tipo: string;
    horario: string;
    duracao: string;
    palestrante_externo: string;
    data_evento_2: string;
    membro_estudante_id: string;
    membros_palestrantes_ids: string[];
    membros_orientadores_ids: string[];
    // Joined data
    estudante?: { nome: string };
}

const Eventos = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [members, setMembers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [eventsRes, membersRes] = await Promise.all([
                supabase
                    .from('eventos')
                    .select('*, estudante:membros!membro_estudante_id(nome)')
                    .order('data_evento', { ascending: false }),
                supabase
                    .from('membros')
                    .select('id, nome')
            ]);

            if (eventsRes.error) console.error('Error fetching events:', eventsRes.error);
            else setEvents(eventsRes.data || []);

            if (membersRes.error) console.error('Error fetching members:', membersRes.error);
            else {
                const memberMap: Record<string, string> = {};
                membersRes.data?.forEach(m => {
                    memberMap[m.id] = m.nome;
                });
                setMembers(memberMap);
            }

            setLoading(false);
        };
        fetchData();
    }, []);

    const now = new Date();
    const getSafeDate = (dateString: string) => {
        if (!dateString) return new Date();
        const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    };
    const upcomingEvents = events.filter(e => getSafeDate(e.data_evento) >= now).sort((a, b) => getSafeDate(a.data_evento).getTime() - getSafeDate(b.data_evento).getTime());
    const pastEvents = events.filter(e => getSafeDate(e.data_evento) < now);

    const formatDate = (dateString: string) => {
        const date = getSafeDate(dateString);
        const options: Intl.DateTimeFormatOptions = { timeZone: 'America/Sao_Paulo' };
        return {
            day: date.toLocaleDateString('pt-BR', { ...options, day: '2-digit' }),
            month: date.toLocaleDateString('pt-BR', { ...options, month: 'short' }).toUpperCase().replace('.', ''),
            full: date.toLocaleDateString('pt-BR', { ...options, day: '2-digit', month: 'long', year: 'numeric' }),
            time: date.toLocaleTimeString('pt-BR', { ...options, hour: '2-digit', minute: '2-digit' })
        };
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'Defesa': return <GraduationCap className="w-5 h-5" />;
            case 'Palestra': return <Presentation className="w-5 h-5" />;
            case 'Workshop': return <UsersIcon className="w-5 h-5" />;
            default: return <Calendar className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando agenda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[80px]">
            {/* Header */}
            <section className="relative bg-slate-900 pt-32 pb-40 overflow-hidden rounded-b-3xl mx-2 mt-2 shadow-lg shadow-blue-900/10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/40 to-blue-600/20"></div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold uppercase tracking-widest mb-8"
                    >
                        <Calendar className="w-4 h-4" /> Calendário GSIPP
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold text-white mb-8"
                    >
                        Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Eventos</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed"
                    >
                        Defesas de TCC, workshops, palestras e minicursos focados em segurança e privacidade.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <div className="container mx-auto px-6 -mt-20 relative z-20 pb-24">

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                    <div className="mb-24">
                        <div className="flex items-center gap-4 mb-12">
                            <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30">
                                <Clock className="w-6 h-6" />
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900">Próximos Eventos</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {upcomingEvents.map((event, idx) => {
                                const dateInfo = formatDate(event.data_evento);
                                const hasMemberSpeakers = event.membros_palestrantes_ids && event.membros_palestrantes_ids.length > 0;
                                const hasOrientadores = event.membros_orientadores_ids && event.membros_orientadores_ids.length > 0;

                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group flex flex-col bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500"
                                    >
                                        <div className="flex flex-col sm:flex-row h-full">
                                            {/* Date Panel */}
                                            <div className={`sm:w-40 p-8 flex flex-col items-center justify-center text-white shrink-0 transition-colors duration-500 ${event.tipo === 'Defesa' ? 'bg-blue-600 group-hover:bg-blue-700' :
                                                event.tipo === 'Palestra' ? 'bg-purple-600 group-hover:bg-purple-700' :
                                                    'bg-slate-900 group-hover:bg-slate-800'
                                                }`}>
                                                <span className="text-sm font-black tracking-widest uppercase mb-1">{dateInfo.month}</span>
                                                <span className="text-5xl font-black">{dateInfo.day}</span>
                                                <div className="mt-4 flex flex-col items-center gap-1">
                                                    <span className="text-xs font-bold opacity-70">{dateInfo.time}</span>
                                                    <div className="w-8 h-1 bg-white/30 rounded-full"></div>
                                                </div>
                                            </div>

                                            {/* Content Panel */}
                                            <div className="p-10 flex flex-col flex-grow relative">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${event.tipo === 'Defesa' ? 'bg-blue-50 text-blue-600' :
                                                        event.tipo === 'Palestra' ? 'bg-purple-50 text-purple-600' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {getTipoIcon(event.tipo)} {event.tipo}
                                                    </span>
                                                    {event.duracao && (
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                                                            <Clock className="w-3 h-3" /> {event.duracao}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                                                    {event.titulo}
                                                </h3>

                                                {event.tipo === 'Defesa' && event.estudante && (
                                                    <div className="mb-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Estudante</p>
                                                        <p className="text-slate-900 font-bold">{event.estudante.nome}</p>
                                                        {hasOrientadores && (
                                                            <div className="mt-3 pt-3 border-t border-blue-100/50">
                                                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Orientadores</p>
                                                                <p className="text-slate-600 text-sm font-medium">
                                                                    {event.membros_orientadores_ids.map(id => members[id]).filter(Boolean).join(', ')}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {(event.tipo === 'Palestra' || event.tipo === 'Workshop' || event.tipo === 'Minicurso') && (
                                                    <div className="mb-4">
                                                        {(hasMemberSpeakers || event.palestrante_externo) && (
                                                            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50">
                                                                <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1">Palestrante(s)</p>
                                                                <div className="flex flex-wrap gap-2 text-slate-900 font-bold">
                                                                    {[
                                                                        ...(event.membros_palestrantes_ids?.map(id => members[id]).filter(Boolean) || []),
                                                                        event.palestrante_externo
                                                                    ].filter(Boolean).join(', ')}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <p className="text-gray-500 line-clamp-2 mb-8 text-sm leading-relaxed">
                                                    {event.descricao}
                                                </p>

                                                <div className="mt-auto flex flex-wrap gap-4">
                                                    {event.link_transmissao && (
                                                        <a
                                                            href={event.link_transmissao}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-xs font-black text-slate-900 hover:text-blue-600 transition-colors py-2 border-b-2 border-slate-900 hover:border-blue-600"
                                                        >
                                                            {event.tipo === 'Defesa' ? 'ASSISTIR TRANSMISSÃO' : 'LINK DE INSCRIÇÃO'} <ChevronRight className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {event.link_certificado && (
                                                        <a
                                                            href={event.link_certificado}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 hover:text-emerald-700 transition-colors py-2 border-b-2 border-emerald-600 hover:border-emerald-700"
                                                        >
                                                            OBTER CERTIFICADO <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Past Events Section */}
                <div>
                    <div className="flex items-center gap-4 mb-12">
                        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/30">
                            <Calendar className="w-6 h-6" />
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900">Eventos Encerrados</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pastEvents.map((event, idx) => {
                            const dateInfo = formatDate(event.data_evento);
                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 opacity-75 hover:opacity-100 flex flex-col h-full"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-gray-400 text-[10px] font-black flex items-center gap-2 uppercase tracking-widest">
                                            <Calendar className="w-3 h-3" /> {dateInfo.full}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${event.tipo === 'Defesa' ? 'text-blue-500' : 'text-slate-400'
                                            }`}>
                                            {event.tipo}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                        {event.titulo}
                                    </h3>

                                    <div className="mt-auto pt-4 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            <MapPin className="w-3 h-3 shrink-0" /> {event.local}
                                        </div>
                                        {event.link_certificado && (
                                            <a href={event.link_certificado} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-emerald-600 hover:underline">
                                                CERTIFICADO DISPONÍVEL
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Eventos;
