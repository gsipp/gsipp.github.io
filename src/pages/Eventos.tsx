import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ChevronRight, GraduationCap, Presentation, Users as UsersIcon, Download, AlertCircle, Search } from 'lucide-react';
import SEO from '../components/SEO';

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
    const [searchTerm, setSearchTerm] = useState('');

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
    
    const filteredEvents = events.filter(e => {
        const matchesSearch = e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             e.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (e.estudante?.nome?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const upcomingEvents = filteredEvents.filter(e => getSafeDate(e.data_evento) >= now).sort((a, b) => getSafeDate(a.data_evento).getTime() - getSafeDate(b.data_evento).getTime());
    const pastEvents = filteredEvents.filter(e => getSafeDate(e.data_evento) < now);

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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative pt-[80px]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-20 pointer-events-none"></div>
            <SEO 
                title="Eventos" 
                description="Defesas de TCC, workshops, palestras e minicursos focados em segurança e privacidade do GSIPP."
            />
            
            {/* Header matches Noticias precisely */}
            <section className="relative bg-slate-900 pt-24 pb-48 overflow-hidden rounded-b-[4rem] mx-2 mt-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-600/20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-sm mx-auto"
                    >
                        <Calendar className="w-3.5 h-3.5" /> CALENDÁRIO GSIPP
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1]"
                    >
                        Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Eventos</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        Defesas de TCC, workshops, palestras e minicursos focados em segurança e privacidade.
                    </motion.p>
                </div>
            </section>

            {/* Search Section */}
            <section className="-mt-12 mb-12 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-3 md:p-4">
                        <div className="relative w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar eventos por título, descrição ou participante..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <div className="container mx-auto px-6 py-16 relative z-20">
                {loading ? (
                    <div className="space-y-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {[1, 2].map(i => (
                                <div key={`skeleton-event-${i}`} className="bg-white rounded-3xl border border-gray-100 h-[28rem] sm:h-72 animate-pulse flex flex-col sm:flex-row">
                                    <div className="sm:w-40 h-32 sm:h-full bg-gray-200 rounded-t-3xl sm:rounded-tr-none sm:rounded-l-3xl"></div>
                                    <div className="p-10 flex-grow space-y-4">
                                        <div className="h-4 w-24 bg-gray-200 rounded-full"></div>
                                        <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                                        <div className="h-20 w-full bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Upcoming Events */}
                        {upcomingEvents.length > 0 && (
                            <div className="mb-24">
                                <div className="flex items-center gap-4 mb-12">
                                    <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white">
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
                                                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all duration-500"
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

                                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
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
                        {pastEvents.length > 0 && (
                            <div>
                                <div className="flex items-center gap-4 mb-12">
                                    <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white">
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
                                                className="group bg-white rounded-3xl border border-gray-100 p-8 transition-all duration-500 opacity-75 hover:opacity-100 flex flex-col h-full relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-3xl bg-slate-900 opacity-10 group-hover:opacity-40 transition-opacity duration-500"></div>
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
                        )}
                        
                        {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200"
                            >
                                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900">Nenhum evento encontrado</h3>
                                <p className="text-gray-500 mt-2">Ainda não há eventos cadastrados no sistema.</p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Eventos;
