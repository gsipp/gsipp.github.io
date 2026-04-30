import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ChevronLeft, Newspaper, Share2, Tag, Clock, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

interface NewsItem {
    id: string;
    titulo: string;
    resumo: string;
    conteudo: string;
    imagem_capa_url: string;
    data_publicacao: string;
    slug: string;
}

const NoticiaDetalhe = () => {
    const { slug } = useParams<{ slug: string }>();
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            const { data, error } = await supabase
                .from('noticias')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) console.error('Error fetching news detail:', error);
            else setNews(data);
            setLoading(false);
            window.scrollTo(0, 0);
        };
        fetchNewsDetail();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[80px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold tracking-widest uppercase text-xs animate-pulse">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-[80px]">
                <div className="text-center px-6">
                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Newspaper className="w-12 h-12 text-gray-300" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Notícia não localizada</h2>
                    <p className="text-gray-500 mb-8">O conteúdo que você procura pode ter sido removido ou o link está incorreto.</p>
                    <Link to="/noticias" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                        <ChevronLeft className="w-5 h-5" /> Voltar para Notícias
                    </Link>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-white pt-[80px] pb-24">
            <SEO 
                title={news.titulo} 
                description={news.resumo}
                image={news.imagem_capa_url}
            />

            {/* Premium Header */}
            <header className="relative bg-slate-900 pt-24 pb-48 overflow-hidden rounded-b-[4rem] mx-2 mt-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-600/20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 mb-8"
                        >
                            <Link to="/noticias" className="group flex items-center gap-2 text-xs font-black text-blue-400 hover:text-white transition-colors tracking-[0.2em]">
                                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> VOLTAR
                            </Link>
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">
                                <Tag className="w-3.5 h-3.5" /> DESTAQUE
                            </div>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-white mb-10 leading-[1.1] tracking-tight"
                        >
                            {news.titulo}
                        </motion.h1>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center gap-8 py-8 border-t border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-none mb-1">Equipe GSIPP</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Comunicação</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                    <Calendar className="w-4 h-4 text-blue-400" /> {formatDate(news.data_publicacao)}
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                                    <Clock className="w-4 h-4 text-emerald-400" /> 5 min de leitura
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Featured Image Container */}
            <section className="container mx-auto px-6 -mt-20 relative z-20">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-5xl mx-auto aspect-[16/8] overflow-hidden rounded-[3rem] border-8 border-white shadow-2xl shadow-slate-900/20 bg-slate-100"
                >
                    {news.imagem_capa_url ? (
                        <img
                            src={news.imagem_capa_url}
                            alt={news.titulo}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <Newspaper className="w-24 h-24 text-slate-300" />
                        </div>
                    )}
                </motion.div>
            </section>

            {/* Content Area */}
            <article className="container mx-auto px-6 mt-20">
                <div className="max-w-4xl mx-auto">
                    {news.resumo && (
                        <div className="mb-16">
                            <p className="text-2xl md:text-3xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-blue-500 pl-8 py-2">
                                {news.resumo}
                            </p>
                        </div>
                    )}

                    <div className="prose prose-lg md:prose-xl max-w-none text-slate-700 leading-[1.8] 
                        prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight 
                        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline 
                        prose-img:rounded-[2rem] prose-img:shadow-xl prose-strong:text-slate-900 
                        prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl
                        prose-pre:bg-slate-900 prose-pre:rounded-2xl prose-code:text-blue-600">
                        
                        <div className="overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {news.conteudo}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-24 pt-16 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-10 bg-slate-50 p-10 rounded-[3rem]">
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Gostou desta notícia?</h4>
                                <p className="text-slate-500">Compartilhe com sua rede e ajude a divulgar a pesquisa brasileira.</p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-200 shadow-sm">
                                    <Share2 className="w-5 h-5 text-blue-500" /> Compartilhar
                                </button>
                                <button className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                                    Copiar Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* More News CTA */}
            <section className="container mx-auto px-6 mt-32">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-slate-900 to-blue-900 rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Fique por dentro de tudo</h2>
                        <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto">Acompanhe nossas pesquisas e eventos em tempo real através da nossa sala de imprensa.</p>
                        <Link to="/noticias" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-sm">
                            Ver todas as notícias <ChevronLeft className="w-5 h-5 rotate-180" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default NoticiaDetalhe;
