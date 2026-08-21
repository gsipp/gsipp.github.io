import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Users, Newspaper, Calendar, BookOpen, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
);

interface Membro {
    id: string;
    nome: string;
    cargo: string;
    foto_url: string | null;
}

interface Noticia {
    id: string;
    titulo: string;
    data_publicacao: string;
}

interface Evento {
    id: string;
    titulo: string;
    data_evento: string | null;
    local: string | null;
    horario?: string;
}

const ProgressBar = ({ label, value, total }: { label: string, value: number, total: number }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="text-slate-500">{value} ({percentage}%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-sm h-1.5 overflow-hidden">
                <div
                    className="h-full bg-slate-400 rounded-sm"
                    style={{ width: `${percentage}%` }}
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

                const { data: recentM } = await supabase.from('membros').select('id, nome, cargo, foto_url').order('created_at', { ascending: false }).limit(5);
                setRecentMembers(recentM || []);

                const { data: allMembers } = await supabase.from('membros').select('cargo');
                const dist: Record<string, number> = {};
                allMembers?.forEach(m => { dist[m.cargo] = (dist[m.cargo] || 0) + 1; });
                setRoleDistribution(dist);

                const { data: recentN } = await supabase.from('noticias').select('id, titulo, data_publicacao').order('data_publicacao', { ascending: false }).limit(3);
                setRecentNews(recentN || []);

                const today = new Date().toISOString().split('T')[0];
                const { data: nextE } = await supabase.from('eventos').select('id, titulo, data_evento, local, horario').gte('data_evento', today).order('data_evento', { ascending: true }).limit(3);
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
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-5 rounded-lg border border-slate-200">
                            <Skeleton className="h-5 w-24 mb-3" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-64 w-full rounded-lg" />
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </div>
                    </div>
                    <Skeleton className="h-[500px] w-full rounded-lg" />
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Membros Ativos', value: statsData.members, icon: Users, path: '/gestao-gsipp/membros' },
        { label: 'Notícias Postadas', value: statsData.news, icon: Newspaper, path: '/gestao-gsipp/noticias' },
        { label: 'Eventos', value: statsData.events, icon: Calendar, path: '/gestao-gsipp/eventos' },
        { label: 'Publicações', value: statsData.publications, icon: BookOpen, path: '/gestao-gsipp/publicacoes' },
    ];

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Visão geral do sistema de gestão.</p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-md">
                    <Clock className="w-3.5 h-3.5" /> 
                    {new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Link to={stat.path} key={index} className="bg-white p-5 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors">{stat.label}</h3>
                            <stat.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </div>
                        <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Atividade Recente */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <h3 className="text-base font-semibold text-slate-900 mb-1">Acesso Rápido</h3>
                        <p className="text-sm text-slate-500 mb-6">Cadastre novos conteúdos facilmente.</p>
                        
                        <div className="flex flex-wrap gap-3">
                            <Link to="/gestao-gsipp/noticias" className="bg-slate-900 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
                                Nova Notícia
                            </Link>
                            <Link to="/gestao-gsipp/eventos" className="bg-white text-slate-700 border border-slate-300 px-4 py-2 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors">
                                Agendar Evento
                            </Link>
                            <Link to="/gestao-gsipp/publicacoes" className="bg-white text-slate-700 border border-slate-300 px-4 py-2 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors">
                                Adicionar Publicação
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Membros */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-semibold text-slate-900">Membros Recentes</h3>
                                <Link to="/gestao-gsipp/membros" className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {recentMembers.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                                            {member.foto_url ? (
                                                <img src={member.foto_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-medium">
                                                    {member.nome.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{member.nome}</p>
                                            <p className="text-xs text-slate-500 truncate">{member.cargo}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentMembers.length === 0 && <p className="text-slate-500 text-sm italic">Nenhum membro recente.</p>}
                            </div>
                        </div>

                        {/* Noticias */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-semibold text-slate-900">Últimas Notícias</h3>
                                <Link to="/gestao-gsipp/noticias" className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {recentNews.map((news) => (
                                    <div key={news.id}>
                                        <span className="text-[10px] font-medium text-slate-400">
                                            {new Date(news.data_publicacao).toLocaleDateString('pt-BR')}
                                        </span>
                                        <h4 className="text-sm font-medium text-slate-900 line-clamp-2 mt-0.5">
                                            {news.titulo}
                                        </h4>
                                    </div>
                                ))}
                                {recentNews.length === 0 && <p className="text-slate-500 text-sm italic">Nenhuma notícia publicada.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Eventos */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-semibold text-slate-900">Próximos Eventos</h3>
                            <Link to="/gestao-gsipp/eventos" className="text-slate-400 hover:text-slate-900 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-5">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="relative pl-4 border-l-2 border-slate-200">
                                    <p className="text-xs font-medium text-slate-500 mb-0.5">
                                        {event.data_evento ? new Date(event.data_evento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'A definir'} • {event.horario?.slice(0, 5) || '--:--'}
                                    </p>
                                    <h4 className="font-medium text-slate-900 text-sm mb-1">{event.titulo}</h4>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <MapPin className="w-3 h-3" /> {event.local || 'A definir'}
                                    </div>
                                </div>
                            ))}
                            {upcomingEvents.length === 0 && (
                                <div className="text-slate-500 text-sm italic">Nenhum evento programado.</div>
                            )}
                        </div>
                    </div>

                    {/* Distribuicao */}
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-6">Distribuição da Equipe</h3>
                        <div className="space-y-1">
                            <ProgressBar label="Docentes" value={roleDistribution['Docente'] || 0} total={statsData.members} />
                            <ProgressBar label="Mestrandos" value={roleDistribution['Mestrando'] || 0} total={statsData.members} />
                            <ProgressBar label="Graduação" value={(roleDistribution['Graduação'] || 0) + (roleDistribution['Graduando'] || 0)} total={statsData.members} />
                            <ProgressBar label="Egressos" value={roleDistribution['Egresso'] || 0} total={statsData.members} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
