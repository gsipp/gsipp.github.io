import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ChevronLeft, Newspaper, Share2, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
            <div className="min-h-screen bg-white flex items-center justify-center pt-[80px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando notícia...</p>
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
                    <Link to="/noticias" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">
                        <ChevronLeft className="w-5 h-5" /> Voltar para Notícias
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-[120px] pb-24">
            {/* Header Section */}
            <header className="container mx-auto px-6 mb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <Link to="/noticias" className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> NOTÍCIAS
                        </Link>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                        <div className="flex items-center gap-2 text-blue-600 text-sm font-bold uppercase tracking-widest">
                            <Tag className="w-3.5 h-3.5" /> Destaque
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 leading-[1.15] tracking-tight">
                        {news.titulo}
                    </h1>

                    <div className="flex items-center gap-6 border-y border-gray-100 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                GS
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 leading-none mb-1">Equipe GSIPP</p>
                                <p className="text-xs text-gray-500 font-medium">Núcleo de Comunicação</p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-gray-100 hidden sm:block"></div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                            <Calendar className="w-4 h-4" /> {(() => {
                                const [year, month, day] = news.data_publicacao.split('T')[0].split('-').map(Number);
                                return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('pt-BR', {
                                    timeZone: 'America/Sao_Paulo',
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </header>

            {/* Featured Image Section */}
            <section className="container mx-auto px-6 mb-16">
                <div className="max-w-6xl mx-auto aspect-[16/7] overflow-hidden rounded-3xl border border-gray-100">
                    {news.imagem_capa_url ? (
                        <img
                            src={news.imagem_capa_url}
                            alt={news.titulo}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Newspaper className="w-24 h-24 text-slate-800" />
                        </div>
                    )}
                </div>
                {news.resumo && (
                    <div className="max-w-4xl mx-auto mt-8">
                        <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed italic border-l-4 border-blue-600 pl-6 py-2">
                            {news.resumo}
                        </p>
                    </div>
                )}
            </section>

            {/* Article Content Area */}
            <article className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-[1.8] prose-headings:text-gray-900 prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-strong:text-gray-900">
                        <ReactMarkdown>{news.conteudo}</ReactMarkdown>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-20 pt-12 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                            <div className="flex flex-wrap justify-center gap-4">
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all border border-gray-200">
                                    <Share2 className="w-5 h-5" /> Compartilhar
                                </button>
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-all border border-gray-200">
                                    Copiar link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default NoticiaDetalhe;
