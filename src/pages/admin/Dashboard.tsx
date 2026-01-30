import { Users, FileText, Calendar, Activity, ArrowRight, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Helper for distribution chart
const ProgressBar = ({ label, value, total, color }: { label: string, value: number, total: number, color: string }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-500">{value} ({percentage}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({ membros: 0, noticias: 0, publicacoes: 0, eventos: 0 });
    const [recentMembers, setRecentMembers] = useState<any[]>([]);
    const [recentNews, setRecentNews] = useState<any[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [roleDistribution, setRoleDistribution] = useState<Record<string, number>>({});

    useEffect(() => {
        async function loadData() {

            // 1. Basic Counts
            const { count: membrosCount } = await supabase.from('membros').select('*', { count: 'exact', head: true });
            const { count: noticiasCount } = await supabase.from('noticias').select('*', { count: 'exact', head: true });
            const { count: pubCount } = await supabase.from('publicacoes').select('*', { count: 'exact', head: true });
            const { count: eventosCount } = await supabase.from('eventos').select('*', { count: 'exact', head: true });

            setStats({
                membros: membrosCount || 0,
                noticias: noticiasCount || 0,
                publicacoes: pubCount || 0,
                eventos: eventosCount || 0
            });

            // 2. Recent Members (last 5)
            const { data: recentM } = await supabase
                .from('membros')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            setRecentMembers(recentM || []);

            // 3. Distribution by Role
            if (recentM) {
                // For a real app, filtering client side for small datasets is fine. For large, use RPC.
                // We fetch ALL members lightly for distribution only if dataset is small, or use the limited recent batch + separate count?
                // Let's just fetch all 'cargo' column for distribution accuracy.
                const { data: allMembers } = await supabase.from('membros').select('cargo');
                const dist: Record<string, number> = {};
                allMembers?.forEach(m => {
                    dist[m.cargo] = (dist[m.cargo] || 0) + 1;
                });
                setRoleDistribution(dist);
            }

            // 4. Recent News
            const { data: recentN } = await supabase
                .from('noticias')
                .select('*')
                .order('data_publicacao', { ascending: false })
                .limit(3);
            setRecentNews(recentN || []);

            // 5. Upcoming Events
            const today = new Date().toISOString().split('T')[0];
            const { data: nextE } = await supabase
                .from('eventos')
                .select('*')
                .gte('data_evento', today)
                .order('data_evento', { ascending: true })
                .limit(3);
            setUpcomingEvents(nextE || []);
        }
        loadData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Visão geral do sistema GSIPP.</p>
                </div>
                <div className="hidden md:block text-sm text-gray-400">
                    Última atualização: {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Membros', value: stats.membros, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Notícias Publicadas', value: stats.noticias, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Eventos Agendados', value: stats.eventos, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Status do Sistema', value: 'Online', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', isStatus: true }
                ].map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            {stat.isStatus ? (
                                <p className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    {stat.value}
                                </p>
                            ) : (
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            )}
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Activities & Charts) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Welcome Banner */}
                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Activity className="w-64 h-64" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Bem-vindo de volta! 👋</h3>
                            <p className="text-indigo-100 mb-6 max-w-lg">
                                Você tem {upcomingEvents.length} eventos programados para os próximos dias e {stats.noticias} notícias publicadas.
                            </p>
                            <div className="flex gap-3">
                                <Link to="/admin/noticias" className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white hover:text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Gerenciar Notícias
                                </Link>
                                <Link to="/admin/eventos" className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Ver Agenda
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recent News & Members Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Newest Members */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-gray-400" /> Novos Membros
                                </h3>
                                <Link to="/admin/membros" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver todos</Link>
                            </div>
                            <div className="space-y-4">
                                {recentMembers.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
                                            {member.foto_url ? (
                                                <img src={member.foto_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-bold">
                                                    {member.nome.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{member.nome}</p>
                                            <p className="text-xs text-gray-500 truncate">{member.cargo} • {member.area_pesquisa}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentMembers.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhum membro recente.</p>}
                            </div>
                        </motion.div>

                        {/* Recent News */}
                        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-400" /> Últimas Notícias
                                </h3>
                                <Link to="/admin/noticias" className="text-sm text-purple-600 hover:text-purple-700 font-medium">Ver todas</Link>
                            </div>
                            <div className="space-y-4">
                                {recentNews.map((news) => (
                                    <div key={news.id} className="group cursor-pointer">
                                        <div className="text-xs text-gray-400 mb-1">{new Date(news.data_publicacao).toLocaleDateString()}</div>
                                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                                            {news.titulo}
                                        </h4>
                                    </div>
                                ))}
                                {recentNews.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhuma notícia publicada.</p>}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Column (Events & Stats) */}
                <div className="space-y-8">

                    {/* Distribution Chart */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-6">Distribuição de Membros</h3>
                        <div className="space-y-1">
                            <ProgressBar label="Docentes" value={roleDistribution['Docente'] || 0} total={stats.membros} color="bg-purple-500" />
                            <ProgressBar label="Mestrandos" value={roleDistribution['Mestrando'] || 0} total={stats.membros} color="bg-blue-500" />
                            <ProgressBar label="Graduação" value={roleDistribution['Graduação'] || 0} total={stats.membros} color="bg-emerald-500" />
                            <ProgressBar label="Egressos" value={roleDistribution['Egresso'] || 0} total={stats.membros} color="bg-gray-400" />
                        </div>
                    </motion.div>

                    {/* Upcoming Events */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-400" /> Próximos Eventos
                            </h3>
                            <Link to="/admin/eventos" className="text-sm text-amber-500 hover:text-amber-600 font-medium"><ArrowRight className="w-4 h-4" /></Link>
                        </div>

                        <div className="relative border-l-2 border-amber-100 pl-6 space-y-6 ml-2">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="relative">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-100 border-2 border-white ring-1 ring-amber-500"></div>
                                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors">
                                        <p className="text-xs font-bold text-amber-600 uppercase mb-1">
                                            {new Date(event.data_evento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {event.horario?.slice(0, 5) || '??:??'}
                                        </p>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{event.titulo}</h4>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin className="w-3 h-3" /> {event.local}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {upcomingEvents.length === 0 && (
                                <div className="text-gray-400 text-sm py-4 italic">Nenhum evento próximo.</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
