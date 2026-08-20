import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, FileDown, Search, X, Users, Calendar, BookOpen, UserCheck, BookText, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

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

const TYPE_TRANSLATIONS: Record<string, string> = {
    'proceedings-article': 'Artigo em Conferência',
    'journal-article': 'Artigo em Periódico',
    'book-chapter': 'Capítulo de Livro',
    'book': 'Livro',
    'PROCEEDINGS_ARTICLE': 'Artigo em Conferência',
    'JOURNAL_ARTICLE': 'Artigo em Periódico',
};

const formatTipo = (tipo: string) => TYPE_TRANSLATIONS[tipo] || tipo;

const TYPE_COLORS: Record<string, { badge: string; icon: string }> = {
    'Artigo em Periódico':   { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'text-blue-500' },
    'Artigo em Conferência': { badge: 'bg-violet-50 text-violet-700 border-violet-200', icon: 'text-violet-500' },
    'Artigo':                { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'text-blue-500' },
    'Tese':                  { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'text-amber-500' },
    'Dissertação':           { badge: 'bg-orange-50 text-orange-700 border-orange-200', icon: 'text-orange-500' },
    'Livro':                 { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'text-emerald-500' },
    'Capítulo de Livro':     { badge: 'bg-teal-50 text-teal-700 border-teal-200', icon: 'text-teal-500' },
    'Preprint':              { badge: 'bg-pink-50 text-pink-700 border-pink-200', icon: 'text-pink-500' },
    'TCC':                   { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'text-emerald-500' },
};

const getTypeStyle = (tipo: string) => {
    const translated = formatTipo(tipo);
    return TYPE_COLORS[translated] || { badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'text-slate-500' };
};

const checkIsMember = (authorName: string, members: string[]) => {
    const authorStr = authorName.toLowerCase().trim();
    if (!authorStr) return false;
    
    return members.some(m => {
        const memStr = m.toLowerCase().trim();
        if (memStr === authorStr) return true;
        if (memStr.includes(authorStr) || authorStr.includes(memStr)) return true;
        
        const memParts = memStr.split(' ').filter(p => p.length > 2);
        const lastName = memParts[memParts.length - 1];
        if (lastName && authorStr.includes(lastName)) {
            const firstName = memParts[0];
            if (firstName && authorStr.includes(firstName)) return true;
            const initial = memStr.charAt(0) + '.';
            if (authorStr.includes(initial)) return true;
        }
        
        return false;
    });
};

const getExternalLinkText = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('tcc') || t.includes('tese') || t.includes('dissertação')) return "Acessar Repositório";
    return "Acessar DOI Oficial";
};

const getPdfText = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('tcc')) return "Visualizar TCC";
    if (t.includes('tese')) return "Visualizar Tese";
    if (t.includes('dissertação')) return "Visualizar Dissertação";
    return "Baixar PDF";
};

const formatAuthorName = (authorStr: string) => {
    if (authorStr.includes(',')) {
        const parts = authorStr.split(',');
        if (parts.length === 2) {
            const lastName = parts[0].trim();
            const firstName = parts[1].trim();
            return `${firstName} ${lastName}`;
        }
    }
    return authorStr;
};

const Publicacoes = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [memberNames, setMemberNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Resetar página ao buscar
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const fetchData = async () => {
            const [pubRes, memRes] = await Promise.all([
                supabase.from('publicacoes').select('*').order('ano', { ascending: false }).order('created_at', { ascending: false }),
                supabase.from('membros').select('nome')
            ]);

            if (pubRes.error) console.error('Error fetching publications:', pubRes.error);
            else setPublications(pubRes.data || []);
            
            if (memRes.error) console.error('Error fetching members:', memRes.error);
            else setMemberNames((memRes.data || []).map(m => m.nome));

            setLoading(false);
        };
        fetchData();
    }, []);

    // Filtra e Agrupa por Ano
    const { groupedPubs, sortedYears, totalPages } = useMemo(() => {
        const filtered = publications.filter(pub =>
            pub.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.autores?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.veiculo?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        
        // Paginação
        const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        const grouped = currentItems.reduce((acc, pub) => {
            if (!acc[pub.ano]) acc[pub.ano] = [];
            acc[pub.ano].push(pub);
            return acc;
        }, {} as Record<number, Publication[]>);

        const years = Object.keys(grouped).map(Number).sort((a, b) => b - a);
        return { groupedPubs: grouped, sortedYears: years, totalPages };
    }, [publications, searchTerm, currentPage]);

    return (
        <div className="min-h-screen bg-slate-50 pt-[80px]">
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

            {/* Busca Elegante */}
            <section className="-mt-12 relative z-20 mb-16">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="relative group rounded-2xl bg-white border border-slate-200 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por título, autores ou evento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-transparent border-none rounded-2xl outline-none text-slate-800 text-lg font-medium placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </section>

            {/* Lista Agrupada por Ano */}
            <section className="pb-32">
                <div className="container mx-auto px-6 max-w-4xl">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-200 h-32 animate-pulse" />
                            ))}
                        </div>
                    ) : sortedYears.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Nenhuma publicação encontrada</h3>
                            <p className="text-slate-500 mt-2">Tente buscar por outras palavras-chave.</p>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {sortedYears.map(year => (
                                <div key={year}>
                                    {/* Cabecalho do Ano */}
                                    <div className="flex items-center gap-6 mb-8">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{year}</h2>
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-4">
                                        {groupedPubs[year].map((pub, idx) => {
                                            const style = getTypeStyle(pub.tipo);
                                            return (
                                                <motion.div
                                                    key={pub.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true, margin: "-50px" }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => setSelectedPub(pub)}
                                                    className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col md:flex-row gap-6 relative"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                                            {pub.tipo && (
                                                                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${style.badge}`}>
                                                                    {formatTipo(pub.tipo)}
                                                                </span>
                                                            )}
                                                            {pub.veiculo && (
                                                                <span className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 px-3 py-1 rounded-md truncate max-w-[300px]">
                                                                    {pub.veiculo}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Titulo completo (sem line-clamp) */}
                                                        <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                                                            {pub.titulo}
                                                        </h3>
                                                        
                                                        {/* Autores completos */}
                                                        <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed flex flex-wrap items-center gap-x-1.5 gap-y-1">
                                                            {pub.autores?.split(';').map((author, i, arr) => {
                                                                const originalAuthorName = author.trim();
                                                                if (!originalAuthorName) return null;
                                                                const authorName = formatAuthorName(originalAuthorName);
                                                                const isMem = checkIsMember(originalAuthorName, memberNames) || checkIsMember(authorName, memberNames);
                                                                return (
                                                                    <span key={i} className={`inline-flex items-center ${isMem ? 'text-slate-800 font-bold' : ''}`}>
                                                                        {authorName}
                                                                        {isMem && <span title="Membro do GSIPP" className="ml-1 flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-500" /></span>}
                                                                        {i < arr.length - 1 ? <span className="text-slate-400 font-normal ml-0.5">;</span> : ''}
                                                                    </span>
                                                                );
                                                            })}
                                                        </p>

                                                        {/* Orientador / Co-orientador no Card */}
                                                        {(pub.orientador || pub.co_orientador) && (
                                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-500">
                                                                {pub.orientador && (
                                                                    <span className="flex items-center gap-1.5">
                                                                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                                                        <span className="font-bold text-slate-600">Orientador:</span> {pub.orientador}
                                                                    </span>
                                                                )}
                                                                {pub.co_orientador && (
                                                                    <span className="flex items-center gap-1.5">
                                                                        <UserCheck className="w-3.5 h-3.5 text-slate-400 opacity-70" />
                                                                        <span className="font-bold text-slate-600">Co-orientador:</span> {pub.co_orientador}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Acoes Rapidas */}
                                                    <div className="flex items-center gap-2 shrink-0 md:self-start md:mt-1" onClick={e => e.stopPropagation()}>
                                                        {pub.link_doi && (
                                                            <a href={pub.link_doi} target="_blank" rel="noopener noreferrer"
                                                                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                                                                title={getExternalLinkText(pub.tipo)}
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        {pub.link_pdf && (
                                                            <a href={pub.link_pdf} target="_blank" rel="noopener noreferrer"
                                                                className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-blue-600 transition-all"
                                                                title={getPdfText(pub.tipo)}
                                                            >
                                                                <FileDown className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Controles de Paginação */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-16 pb-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition-all font-medium hover:border-blue-300 disabled:hover:border-slate-200"
                            >
                                <ChevronLeft className="w-4 h-4" /> Anterior
                            </button>
                            <span className="text-sm font-medium text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition-all font-medium hover:border-blue-300 disabled:hover:border-slate-200"
                            >
                                Próxima <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal Premium */}
            <AnimatePresence>
                {selectedPub && (() => {
                    const style = getTypeStyle(selectedPub.tipo);
                    const authorsList = selectedPub.autores?.split(';').map(a => a.trim()).filter(Boolean) || [];
                    return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={() => setSelectedPub(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                {/* Header do Modal - Cinza claro para destacar do corpo */}
                                <div className="bg-slate-50 border-b border-slate-100 p-6 sm:p-8 flex items-start justify-between gap-4 shrink-0">
                                    <div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {selectedPub.tipo && (
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${style.badge}`}>
                                                    {formatTipo(selectedPub.tipo)}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {selectedPub.ano}
                                            </span>
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">{selectedPub.titulo}</h2>
                                    </div>
                                    <button onClick={() => setSelectedPub(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors shrink-0 bg-white border border-slate-200">
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                {/* Corpo Rolavel */}
                                <div className="p-6 sm:p-8 overflow-y-auto">
                                    <div className="space-y-6">
                                        {/* Autores */}
                                        {authorsList.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Users className="w-4 h-4" /> Autoria
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {authorsList.map((author, i) => {
                                                        const authorName = formatAuthorName(author);
                                                        const isMem = checkIsMember(author, memberNames) || checkIsMember(authorName, memberNames);
                                                        return (
                                                            <span key={i} className={`text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 border ${
                                                                isMem ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                                                            }`}>
                                                                {authorName}
                                                                {isMem && <span title="Membro do GSIPP"><CheckCircle2 className="w-4 h-4 text-blue-500" /></span>}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {/* Local / Evento */}
                                            {selectedPub.veiculo && (
                                                <div>
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4" /> Publicado em
                                                    </h3>
                                                    <p className="text-slate-800 font-medium bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                                        {selectedPub.veiculo}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Orientação */}
                                            {(selectedPub.orientador || selectedPub.co_orientador) && (
                                                <div className="space-y-4">
                                                    {selectedPub.orientador && (
                                                        <div>
                                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <UserCheck className="w-4 h-4" /> Orientador
                                                            </h3>
                                                            <p className="text-slate-800 font-medium">{selectedPub.orientador}</p>
                                                        </div>
                                                    )}
                                                    {selectedPub.co_orientador && (
                                                        <div>
                                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <UserCheck className="w-4 h-4 opacity-70" /> Co-orientador
                                                            </h3>
                                                            <p className="text-slate-800 font-medium">{selectedPub.co_orientador}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Rodapé com Ações */}
                                {(selectedPub.link_doi || selectedPub.link_pdf) && (
                                    <div className="bg-slate-50 border-t border-slate-100 p-6 shrink-0 flex flex-col sm:flex-row gap-3">
                                        {selectedPub.link_doi && (
                                            <a href={selectedPub.link_doi} target="_blank" rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                                            >
                                                {getExternalLinkText(selectedPub.tipo)} <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        {selectedPub.link_pdf && (
                                            <a href={selectedPub.link_pdf} target="_blank" rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                                            >
                                                {getPdfText(selectedPub.tipo)} <FileDown className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

export default Publicacoes;
