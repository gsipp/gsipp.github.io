import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, ArrowRight, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        const date = new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`);
        return date.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[80px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando notícias...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[80px]">
            {/* Hero Header */}
            <section className="relative bg-slate-900 pt-32 pb-24 overflow-hidden rounded-b-3xl mx-2 mt-2 shadow-lg shadow-blue-900/10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6"
                        >
                            <Newspaper className="w-4 h-4" /> Sala de Imprensa
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-6"
                        >
                            Notícias & <span className="text-blue-400">Destaques</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg leading-relaxed"
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

            {/* News Grid */}
            <section className="pb-16">
                <div className="container mx-auto px-6">
                    {currentNews.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Nenhuma notícia encontrada</h3>
                            <p className="text-gray-500 mt-2">Tente buscar por outros termos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <AnimatePresence mode="popLayout">
                                {currentNews.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col"
                                    >
                                        <Link to={`/noticias/${item.slug}`} className="flex flex-col h-full">
                                            {/* Image Header with Aspect Ratio 4:5 */}
                                            <div className="aspect-[4/5] overflow-hidden relative">
                                                {item.imagem_capa_url ? (
                                                    <img
                                                        src={item.imagem_capa_url}
                                                        alt={item.titulo}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                                        <Newspaper className="w-16 h-16 text-slate-800" />
                                                    </div>
                                                )}
                                                <div className="absolute top-6 left-6">
                                                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/50 flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest">
                                                        <Calendar className="w-4 h-4 text-blue-600" /> {formatDate(item.data_publicacao)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-8 flex flex-col flex-grow">
                                                <h2 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {item.titulo}
                                                </h2>
                                                <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed">
                                                    {item.resumo}
                                                </p>
                                                <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all duration-300">
                                                    Ler reportagem completa <ArrowRight className="w-5 h-5" />
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
