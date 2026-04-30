import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, Search, Filter, ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

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
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-[80px] relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-20 pointer-events-none"></div>
            <SEO
                title="Sala de Imprensa"
                description="Acompanhe as últimas notícias, eventos e destaques do grupo de pesquisa GSIPP."
            />
            {/* Hero Header - Premium Centered Style */}
            <section className="relative bg-slate-900 pt-24 pb-48 overflow-hidden rounded-b-[4rem] mx-2 mt-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-600/20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-sm mx-auto"
                    >
                        <Newspaper className="w-3.5 h-3.5" /> SALA DE IMPRENSA
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1]"
                    >
                        Notícias & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Destaques</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        Acompanhe as últimas atualizações sobre pesquisas, eventos e conquistas do Grupo de Segurança da Informação e Privacidade.
                    </motion.p>
                </div>
            </section>

            {/* Search and Filters - Floating Design */}
            <section className="-mt-12 mb-20 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-slate-100 p-2 md:p-3 flex flex-col md:flex-row gap-2">
                        <div className="relative flex-grow">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar notícias..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-16 pr-6 py-5 bg-slate-50/50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-300"
                            />
                        </div>
                        <div className="hidden md:flex items-center gap-3 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/20">
                            <Filter className="w-4 h-4" /> FILTRAR
                        </div>
                    </div>
                </div>
            </section>

            {/* News List - Modern Grid */}
            <section className="pb-32">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={`skeleton-news-${i}`} className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6 animate-pulse border border-slate-100">
                                    <div className="aspect-[16/10] bg-slate-200 rounded-[2rem] w-full"></div>
                                    <div className="space-y-4">
                                        <div className="h-3 w-24 bg-slate-200 rounded-full"></div>
                                        <div className="h-8 w-full bg-slate-200 rounded-xl"></div>
                                        <div className="h-4 w-5/6 bg-slate-200 rounded-lg"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : currentNews.length === 0 ? (
                        <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 max-w-4xl mx-auto">
                            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4">Nenhuma notícia encontrada</h3>
                            <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">Não encontramos resultados para sua busca. Tente buscar por outros termos ou explore as notícias recentes.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <AnimatePresence mode="popLayout">
                                {currentNews.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group"
                                    >
                                        <Link to={`/noticias/${item.slug}`} className="block h-full bg-white rounded-[3rem] border border-slate-100 p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 relative overflow-hidden group">
                                            <div className="aspect-[16/10] rounded-[2.2rem] overflow-hidden relative mb-8 shadow-inner border border-slate-50">
                                                {item.imagem_capa_url ? (
                                                    <img
                                                        src={item.imagem_capa_url}
                                                        alt={item.titulo}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                        <Newspaper className="w-12 h-12 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                                                    Blog Post
                                                </div>
                                            </div>

                                            <div className="px-4 pb-4">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <span className="text-blue-600 text-[10px] font-black flex items-center gap-2 uppercase tracking-widest">
                                                        <Calendar className="w-3.5 h-3.5" /> {formatDate(item.data_publicacao)}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                    <span className="text-slate-400 text-[10px] font-black flex items-center gap-2 uppercase tracking-widest">
                                                        <Clock className="w-3.5 h-3.5" /> 5 MIN
                                                    </span>
                                                </div>

                                                <h2 className="text-xl font-black text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                                                    {item.titulo}
                                                </h2>

                                                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                                                    {item.resumo}
                                                </p>

                                                <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                                                    Ler Artigo Completo <ArrowRight className="w-4 h-4 text-blue-500" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>

            {/* Pagination Controls - Premium Styling */}
            {totalPages > 1 && (
                <section className="pb-32">
                    <div className="container mx-auto px-6 flex justify-center items-center gap-16">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all group"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" /> ANTERIOR
                        </button>

                        <div className="flex items-center gap-3">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => paginate(page)}
                                    className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${currentPage === page
                                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-110'
                                            : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-all group"
                        >
                            PRÓXIMO <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Noticias;
