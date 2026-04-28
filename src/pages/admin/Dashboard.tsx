import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Newspaper, Calendar, ArrowRight, TrendingUp, MapPin, Activity, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Animated Counter Component
const AnimatedCounter = ({ value }: { value: number }) => {
    return (
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
        >
            {value}
        </motion.span>
    );
};

// Skeleton Component
const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-skeleton rounded-lg ${className}`} />
);

interface Membro {
    id: string;
    nome: string;
    cargo: string;
    area_pesquisa: string | null;
    foto_url: string | null;
    created_at: string;
}

interface Noticia {
    id: string;
    titulo: string;
    slug: string;
    data_publicacao: string;
}

interface Evento {
    id: string;
    titulo: string;
    data_evento: string | null;
    local: string | null;
    horario?: string;
}

const ProgressBar = ({ label, value, total, colorClass }: { label: string, value: number, total: number, colorClass: string }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500">{value} ({percentage}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colorClass}`}
                />
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({ members: 0, news: 0, publications: 0, events: 0 });
    const [recentMembers, setRecentMembers] = useState<Membro[]>([]);
    const [recentNews, setRecentNews] = useState<Noticia[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Evento[]>([]);
    const [roleDistribution, setRoleDistribution] = useState<Record<string, number>>({});

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [membersCount, newsCount, pubCount, eventsCount] = await Promise.all([
                    supabase.from('membros').select('*', { count: 'exact', head: true }),
                    supabase.from('noticias').select('*', { count: 'exact', head: true }),
                    supabase.from('publicacoes').select('*', { count: 'exact', head: true }),
                    supabase.from('eventos').select('*', { count: 'exact', head: true })
                ]);

                setStatsData({
                    members: membersCount.count || 0,
                    news: newsCount.count || 0,
                    publications: pubCount.count || 0,
                    events: eventsCount.count || 0
                });

                const { data: recentM } = await supabase.from('membros').select('*').order('created_at', { ascending: false }).limit(5);
                setRecentMembers(recentM || []);

                const { data: allMembers } = await supabase.from('membros').select('cargo');
                const dist: Record<string, number> = {};
                allMembers?.forEach(m => { dist[m.cargo] = (dist[m.cargo] || 0) + 1; });
                setRoleDistribution(dist);

                const { data: recentN } = await supabase.from('noticias').select('*').order('data_publicacao', { ascending: false }).limit(3);
                setRecentNews(recentN || []);

                const today = new Date().toISOString().split('T')[0];
                const { data: nextE } = await supabase.from('eventos').select('*').gte('data_evento', today).order('data_evento', { ascending: true }).limit(3);
                setUpcomingEvents(nextE || []);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="max-w-[1400px] mx-auto space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-5 w-80" />
                    </div>
                    <Skeleton className="h-12 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-12 w-12 rounded-2xl" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-[300px] w-full rounded-3xl" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-[400px] w-full rounded-3xl" />
                            <Skeleton className="h-[400px] w-full rounded-3xl" />
                        </div>
                    </div>
                    <Skeleton className="h-full w-full rounded-3xl min-h-[600px]" />
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Membros Ativos', value: statsData.members, icon: Users, color: 'blue', path: '/admin/membros' },
        { label: 'Notícias Postadas', value: statsData.news, icon: Newspaper, color: 'slate', path: '/admin/noticias' },
        { label: 'Eventos Agendados', value: statsData.events, icon: Calendar, color: 'blue', path: '/admin/eventos' },
        { label: 'Publicações', value: statsData.publications, icon: BookOpen, color: 'slate', path: '/admin/publicacoes' },
    ];

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <motion.div className="space-y-10" variants={containerVariants} initial="hidden" animate="visible">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">Bem-vindo à central de gestão do GSIPP.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4" /> {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </header>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Link to={stat.path} key={index} className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 group">
                        <div className="flex items-start justify-between mb-5">
                            <div className={`p-4 rounded-2xl transition-colors ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white'}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg text-xs font-bold">
                                <TrendingUp className="w-3 h-3" />
                                <span>+12%</span>
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 mb-1">
                            <AnimatedCounter value={stat.value} />
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </Link>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <motion.div variants={itemVariants} className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                            <Activity className="w-64 h-64" />
                        </div>
                        <div className="relative z-10">
                            <span className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6 inline-block">Status do Grupo</span>
                            <h3 className="text-3xl font-bold mb-4">Mantenha o grupo atualizado 👋</h3>
                            <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
                                Atualmente temos {upcomingEvents.length} eventos pendentes. Que tal publicar uma nova notícia para manter o engajamento?
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/admin/noticias" className="bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2">
                                    Nova Notícia
                                </Link>
                                <Link to="/admin/eventos" className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-400 transition-all flex items-center gap-2">
                                    Agendar Evento <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Novos Membros</h3>
                                <Link to="/admin/membros" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><ArrowRight className="w-4 h-4" /></Link>
                            </div>
                            <div className="space-y-6">
                                {recentMembers.map((member) => (
                                    <div key={member.id} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0 group-hover:shadow-md transition-all">
                                            {member.foto_url ? (
                                                <img src={member.foto_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-black">
                                                    {member.nome.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{member.nome}</p>
                                            <p className="text-xs font-medium text-slate-400 truncate uppercase tracking-wider">{member.cargo}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentMembers.length === 0 && <p className="text-slate-400 text-sm italic py-4">Nenhum membro recente.</p>}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Últimas Notícias</h3>
                                <Link to="/admin/noticias" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><ArrowRight className="w-4 h-4" /></Link>
                            </div>
                            <div className="space-y-6">
                                {recentNews.map((news) => (
                                    <div key={news.id} className="group cursor-pointer">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{new Date(news.data_publicacao).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mt-1 leading-snug">
                                            {news.titulo}
                                        </h4>
                                    </div>
                                ))}
                                {recentNews.length === 0 && <p className="text-slate-400 text-sm italic py-4">Nenhuma notícia publicada.</p>}
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="space-y-8">
                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                        <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg mb-8">Distribuição</h3>
                        <div className="space-y-2">
                            <ProgressBar label="Docentes" value={roleDistribution['Docente'] || 0} total={statsData.members} colorClass="bg-slate-900" />
                            <ProgressBar label="Mestrandos" value={roleDistribution['Mestrando'] || 0} total={statsData.members} colorClass="bg-blue-500" />
                            <ProgressBar label="Graduação" value={roleDistribution['Graduando'] || 0} total={statsData.members} colorClass="bg-blue-200" />
                            <ProgressBar label="Egressos" value={roleDistribution['Egresso'] || 0} total={statsData.members} colorClass="bg-slate-200" />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg">Próximos Eventos</h3>
                            <Link to="/admin/eventos" className="text-blue-600 hover:text-blue-700 transition-colors"><ArrowRight className="w-5 h-5" /></Link>
                        </div>

                        <div className="space-y-6">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="relative pl-6 border-l-2 border-blue-100">
                                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                                        {event.data_evento ? new Date(event.data_evento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Data a definir'} • {event.horario?.slice(0, 5) || '--:--'}
                                    </p>
                                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-2">{event.titulo}</h4>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <MapPin className="w-3 h-3 text-blue-500" /> {event.local || 'Local a definir'}
                                    </div>
                                </div>
                            ))}
                            {upcomingEvents.length === 0 && (
                                <div className="text-slate-400 text-sm italic py-4">Nenhum evento programado.</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
