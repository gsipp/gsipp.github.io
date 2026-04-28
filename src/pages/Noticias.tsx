import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import NetworkBackground from '../components/NetworkBackground';

interface NewsItem {
    id: string;
    titulo: string;
    resumo: string;
    imagem_capa_url: string;
    data_publicacao: string;
    slug: string;
}

const Noticias = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchNews = async () => {
            const { data, error } = await supabase
                .from('noticias')
                .select('*')
                .eq('publicado', true)
                .order('data_publicacao', { ascending: false });

            if (error) console.error('Error fetching news:', error);
            else setNews(data || []);
            setLoading(false);
        };
        fetchNews();
    }, []);

    const filteredNews = news.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.resumo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentNews = filteredNews.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
        const date = new Date(year, month - 1, day, 12, 0, 0);
        return date.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };



    return (
        <div className="min-h-screen bg-gray-50 pt-[80px]">
            <SEO 
                title="Sala de Imprensa" 
                description="Acompanhe as últimas notícias, eventos e destaques do grupo de pesquisa GSIPP."
            />
            {/* Hero Header */}
            <section className="relative bg-slate-900 pt-32 pb-24 overflow-hidden rounded-b-3xl mx-2 mt-2">
                <NetworkBackground />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/90 to-slate-900 pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm"
                        >
                            <Newspaper className="w-4 h-4" /> Sala de Imprensa
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
                        >
                            Notícias & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Destaques</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg leading-relaxed max-w-2xl"
                        >
                            Acompanhe as últimas atualizações sobre pesquisas, eventos e conquistas do Grupo de Segurança da Informação e Privacidade.
                        </motion.p>
                    </div>
                </div>
            </section>

            {/* Search and Filters */}
            <section className="-mt-10 mb-12 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar notícias..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-700"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-semibold hover:bg-gray-100 transition-all flex-grow md:flex-grow-0">
                                <Filter className="w-5 h-5" /> Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* News List */}
            <section className="pb-16">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <div className="space-y-8">
                            {[1, 2, 3].map(i => (
                                <div key={`skeleton-news-${i}`} className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row gap-8 items-start animate-pulse">
                                    <div className="w-full md:w-64 h-48 rounded-3xl bg-gray-200 shrink-0"></div>
                                    <div className="flex-grow w-full space-y-4">
                                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-full bg-gray-100 rounded"></div>
                                            <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 w-full md:w-32 h-14 bg-gray-200 rounded-2xl self-center"></div>
                                </div>
                            ))}
                        </div>
                    ) : currentNews.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Nenhuma notícia encontrada</h3>
                            <p className="text-gray-500 mt-2">Tente buscar por outros termos.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <AnimatePresence mode="popLayout">
                                {currentNews.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative"
                                    >
                                        <Link to={`/noticias/${item.slug}`} className="flex flex-col md:flex-row gap-8 items-start p-8 relative h-full w-full">
                                            <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-3xl bg-blue-500 opacity-10 group-hover:opacity-40 transition-opacity duration-500"></div>

                                            <div className="shrink-0 w-full md:w-64 h-48 rounded-2xl overflow-hidden relative border border-gray-50 shadow-inner">
                                                {item.imagem_capa_url ? (
                                                    <img
                                                        src={item.imagem_capa_url}
                                                        alt={item.titulo}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                        <Newspaper className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-grow space-y-4">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-gray-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                                        <Calendar className="w-3.5 h-3.5" /> Postado em {formatDate(item.data_publicacao)}
                                                    </span>
                                                </div>

                                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                    {item.titulo}
                                                </h2>

                                                <p className="text-gray-500 text-sm leading-relaxed max-w-4xl">
                                                    {item.resumo}
                                                </p>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <section className="pb-24 border-t border-gray-100 mt-12 pt-12">
                    <div className="container mx-auto px-6 flex justify-center items-center gap-12">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-all group"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Anterior
                        </button>

                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                            Página {currentPage} <span className="mx-2">/</span> {totalPages}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-all group"
                        >
                            Próximo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Noticias;
