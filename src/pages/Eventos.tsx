import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';

interface Event {
    id: string;
    titulo: string;
    data_evento: string;
    local: string;
    descricao: string;
    link_inscricao: string;
    imagem_url: string;
}

const Eventos = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('eventos')
                .select('*')
                .order('data_evento', { ascending: false });

            if (error) console.error('Error fetching events:', error);
            else setEvents(data || []);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    const now = new Date();
    const upcomingEvents = events.filter(e => new Date(e.data_evento) >= now).sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime());
    const pastEvents = events.filter(e => new Date(e.data_evento) < now);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('pt-BR', { day: '2-digit' }),
            month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
            full: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando eventos...</p>
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
                        Participe de workshops, seminários e hackathons focados no futuro da segurança digital.
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
                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group flex flex-col sm:flex-row bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500"
                                    >
                                        {/* Date Panel */}
                                        <div className="sm:w-40 bg-blue-600 p-8 flex flex-col items-center justify-center text-white shrink-0 group-hover:bg-slate-900 transition-colors duration-500">
                                            <span className="text-4xl font-black mb-1">{dateInfo.day}</span>
                                            <span className="text-sm font-bold tracking-widest uppercase">{dateInfo.month}</span>
                                            <div className="mt-4 w-10 h-1 bg-white/30 rounded-full"></div>
                                        </div>

                                        {/* Content Panel */}
                                        <div className="p-10 flex flex-col flex-grow relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors"></div>

                                            <div className="relative z-10 flex flex-col h-full">
                                                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                                    <span className="flex items-center gap-1.5 text-blue-600">
                                                        <Clock className="w-3.5 h-3.5" /> {dateInfo.time}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5" /> {event.local}
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                                                    {event.titulo}
                                                </h3>

                                                <p className="text-gray-500 line-clamp-2 mb-8 text-sm leading-relaxed">
                                                    {event.descricao}
                                                </p>

                                                <div className="mt-auto">
                                                    <a
                                                        href={event.link_inscricao}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-sm font-black text-slate-900 hover:text-blue-600 transition-colors py-2 border-b-2 border-slate-900 hover:border-blue-600"
                                                    >
                                                        INSCREVER-SE <ChevronRight className="w-4 h-4" />
                                                    </a>
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
                                    className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 opacity-75 hover:opacity-100"
                                >
                                    <div className="text-gray-400 text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-tighter">
                                        <Calendar className="w-4 h-4" /> {dateInfo.full}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                        {event.titulo}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                        <MapPin className="w-4 h-4 shrink-0" /> {event.local}
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
