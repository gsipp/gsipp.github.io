import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { BookText, ExternalLink, FileDown, Search, Filter, X, Users, Calendar, BookOpen, Tag, UserCheck } from 'lucide-react';
import SEO from '../components/SEO';
import NetworkBackground from '../components/NetworkBackground';

interface Publication {
    id: string;
    titulo: string;
    ano: number;
    autores: string;
    veiculo: string;
    tipo: string;
    link_doi: string;
    link_pdf: string;
    orientador?: string;
    co_orientador?: string;
}

const TYPE_COLORS: Record<string, { bar: string; badge: string; text: string }> = {
    'Artigo em Periódico':   { bar: 'bg-blue-500',   badge: 'bg-blue-50 border-blue-200 text-blue-700',   text: 'text-blue-600' },
    'Artigo em Conferência': { bar: 'bg-violet-500', badge: 'bg-violet-50 border-violet-200 text-violet-700', text: 'text-violet-600' },
    'Artigo':                { bar: 'bg-blue-500',   badge: 'bg-blue-50 border-blue-200 text-blue-700',   text: 'text-blue-600' },
    'Tese':                  { bar: 'bg-amber-500',  badge: 'bg-amber-50 border-amber-200 text-amber-700',  text: 'text-amber-600' },
    'Dissertação':           { bar: 'bg-orange-500', badge: 'bg-orange-50 border-orange-200 text-orange-700', text: 'text-orange-600' },
    'Livro':                 { bar: 'bg-emerald-500',badge: 'bg-emerald-50 border-emerald-200 text-emerald-700', text: 'text-emerald-600' },
    'Capítulo de Livro':     { bar: 'bg-teal-500',   badge: 'bg-teal-50 border-teal-200 text-teal-700',   text: 'text-teal-600' },
    'Preprint':              { bar: 'bg-pink-500',   badge: 'bg-pink-50 border-pink-200 text-pink-700',   text: 'text-pink-600' },
    'TCC':                   { bar: 'bg-emerald-500', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700', text: 'text-emerald-600' },
};

const TYPE_TRANSLATIONS: Record<string, string> = {
    'proceedings-article': 'Artigo em Conferência',
    'journal-article': 'Artigo em Periódico',
    'book-chapter': 'Capítulo de Livro',
    'book': 'Livro',
    'PROCEEDINGS_ARTICLE': 'Artigo em Conferência',
    'JOURNAL_ARTICLE': 'Artigo em Periódico',
};

const getTypeStyle = (tipo: string) => {
    const translated = TYPE_TRANSLATIONS[tipo] || tipo;
    return TYPE_COLORS[translated] || { bar: 'bg-slate-400', badge: 'bg-slate-50 border-slate-200 text-slate-600', text: 'text-slate-600' };
};

const formatTipo = (tipo: string) => TYPE_TRANSLATIONS[tipo] || tipo;

const Publicacoes = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'Todos'>('Todos');
    const [selectedPub, setSelectedPub] = useState<Publication | null>(null);

    useEffect(() => {
        const fetchPublications = async () => {
            const { data, error } = await supabase
                .from('publicacoes')
                .select('*')
                .order('ano', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) console.error('Error fetching publications:', error);
            else setPublications(data || []);
            setLoading(false);
        };
        fetchPublications();
    }, []);

    const filteredPublications = publications.filter(pub => {
        const matchesSearch =
            pub.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.autores?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.veiculo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = selectedYear === 'Todos' || pub.ano === selectedYear;
        return matchesSearch && matchesYear;
    });

    const stats = {
        artigos: publications.filter(p => {
            const t = formatTipo(p.tipo);
            return t.includes('Artigo') || t === 'Preprint';
        }).length,
        tccs: publications.filter(p => {
            const t = formatTipo(p.tipo);
            return ['TCC', 'Tese', 'Dissertação'].includes(t);
        }).length
    };

    const years: (number | 'Todos')[] = (['Todos', ...Array.from(new Set(publications.map(p => p.ano)))] as (number | 'Todos')[]).sort((a, b) => {
        if (a === 'Todos') return -1;
        if (b === 'Todos') return 1;
        return (b as number) - (a as number);
    });

    return (
        <div className="min-h-screen bg-slate-50 pt-[80px] relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-20 pointer-events-none"></div>
            <SEO
                title="Produção Acadêmica"
                description="Explore nosso acervo de artigos científicos, conferências e periódicos do GSIPP."
            />

            {/* Header */}
            <section className="relative bg-slate-900 pt-24 pb-48 overflow-hidden rounded-b-[4rem] mx-2 mt-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-600/20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-sm mx-auto"
                    >
                        <BookText className="w-3.5 h-3.5" /> PRODUÇÃO ACADÊMICA
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1]"
                    >
                        Publicações de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Impacto</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        Explore nosso acervo de artigos científicos, conferências e periódicos que contribuem para o avanço da segurança cibernética mundial.
                    </motion.p>
                </div>
            </section>

            {/* Filters */}
            <section className="-mt-12 mb-20 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
                        <div className="p-2 md:p-3 flex flex-col md:flex-row gap-2">
                            <div className="relative flex-grow">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por título, autores ou veículo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-16 pr-6 py-5 bg-slate-50/50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-300"
                                />
                            </div>
                            <div className="hidden md:flex items-center gap-3 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/20">
                                <Filter className="w-4 h-4" /> FILTRAR
                            </div>
                        </div>
                        
                        <div className="bg-slate-50/50 border-t border-slate-100 p-4 md:px-8 flex flex-col md:flex-row items-center gap-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Selecione o Ano:</span>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full">
                                {years.map(year => (
                                    <button
                                        key={year}
                                        onClick={() => setSelectedYear(year)}
                                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] whitespace-nowrap transition-all uppercase tracking-widest border-2 ${selectedYear === year
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                            : 'bg-white border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600'}`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Publications List */}
            <section className="pb-24">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-28 animate-pulse" />
                            ))}
                        </div>
                    ) : filteredPublications.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Nenhuma publicação encontrada</h3>
                            <p className="text-gray-500 mt-2">Tente ajustar seus filtros de busca ou ano.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredPublications.map((pub, idx) => {
                                const style = getTypeStyle(pub.tipo);
                                return (
                                    <motion.div
                                        key={pub.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx % 10 * 0.04 }}
                                        onClick={() => setSelectedPub(pub)}
                                        className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex"
                                    >
                                        {/* Barra lateral colorida por tipo */}
                                        <div className={`w-1.5 shrink-0 ${style.bar}`} />

                                        <div className="flex-1 p-5 flex flex-col md:flex-row gap-4 md:items-center">
                                            {/* Ano em destaque */}
                                            <div className="hidden md:flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-xl shrink-0 border border-slate-100">
                                                <span className="text-lg font-black text-slate-800 leading-none">{pub.ano}</span>
                                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Ano</span>
                                            </div>

                                            {/* Conteúdo principal */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="md:hidden text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{pub.ano}</span>
                                                    {pub.tipo && (
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                                                            {formatTipo(pub.tipo)}
                                                        </span>
                                                    )}
                                                    {pub.veiculo && (
                                                        <span className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full truncate max-w-[240px]">
                                                            {pub.veiculo}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className={`font-bold text-slate-900 text-base leading-snug mb-1.5 line-clamp-2 group-hover:${style.text} transition-colors`}>
                                                    {pub.titulo}
                                                </h3>

                                                <p className="text-slate-400 text-sm truncate">{pub.autores}</p>
                                            </div>

                                            {/* Links rápidos */}
                                            <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center" onClick={e => e.stopPropagation()}>
                                                {pub.link_doi && (
                                                    <a href={pub.link_doi} target="_blank" rel="noopener noreferrer"
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-colors flex items-center gap-1.5"
                                                        title="Abrir DOI"
                                                    >
                                                        DOI <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                                {pub.link_pdf && (
                                                    <a href={pub.link_pdf} target="_blank" rel="noopener noreferrer"
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-blue-600 transition-colors flex items-center gap-1.5"
                                                        title="Ver PDF"
                                                    >
                                                        PDF <FileDown className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedPub && (() => {
                    const style = getTypeStyle(selectedPub.tipo);
                    const authorsList = selectedPub.autores?.split(';').map(a => a.trim()).filter(Boolean) || [];
                    return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                                onClick={() => setSelectedPub(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
                            >
                                {/* Top bar */}
                                <div className={`h-1.5 w-full ${style.bar}`} />

                                <div className="p-8">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPub.tipo && (
                                                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${style.badge}`}>
                                                    {formatTipo(selectedPub.tipo)}
                                                </span>
                                            )}
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {selectedPub.ano}
                                            </span>
                                            {selectedPub.veiculo && (
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" /> {selectedPub.veiculo}
                                                </span>
                                            )}
                                        </div>
                                        <button onClick={() => setSelectedPub(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0">
                                            <X className="w-5 h-5 text-slate-400" />
                                        </button>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-xl font-black text-slate-900 leading-snug mb-6">{selectedPub.titulo}</h2>

                                    {/* Info Grid */}
                                    <div className="space-y-4">
                                        {/* Venue */}
                                        {selectedPub.veiculo && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Evento / Revista</p>
                                                    <p className="text-slate-800 font-semibold">{selectedPub.veiculo}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Authors */}
                                        {authorsList.length > 0 && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <Users className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Autores</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {authorsList.map((author, i) => (
                                                            <span key={i} className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                                {author}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Advisors */}
                                        {(selectedPub.orientador || selectedPub.co_orientador) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                {selectedPub.orientador && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                                                            <UserCheck className="w-4 h-4 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Orientador</p>
                                                            <p className="text-slate-800 font-semibold text-sm">{selectedPub.orientador}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedPub.co_orientador && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                                                            <Users className="w-4 h-4 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Co-orientador</p>
                                                            <p className="text-slate-800 font-semibold text-sm">{selectedPub.co_orientador}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Type */}
                                        {selectedPub.tipo && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <Tag className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tipo de Publicação</p>
                                                    <p className="text-slate-800 font-semibold">{formatTipo(selectedPub.tipo)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {(selectedPub.link_doi || selectedPub.link_pdf) && (
                                        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
                                            {selectedPub.link_doi && (
                                                <a href={selectedPub.link_doi} target="_blank" rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all"
                                                >
                                                    Acessar DOI <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            {selectedPub.link_pdf && (
                                                <a href={selectedPub.link_pdf} target="_blank" rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                                                >
                                                    Ver PDF <FileDown className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

export default Publicacoes;
