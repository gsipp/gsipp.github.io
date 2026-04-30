import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, FileDown, AlertCircle, Clock, Search, Filter } from 'lucide-react';
import SEO from '../components/SEO';

interface Edital {
    id: string;
    titulo: string;
    descricao: string;
    link_pdf: string;
    data_abertura: string;
    data_fechamento: string;
    status: string;
}

type FilterStatus = 'Todos' | 'Aberto' | 'Fechado' | 'Em Análise';

const Editais = () => {
    const [editais, setEditais] = useState<Edital[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEditais = async () => {
            const { data, error } = await supabase
                .from('editais')
                .select('*')
                .order('data_abertura', { ascending: false });

            if (error) console.error('Error fetching editais:', error);
            else setEditais(data || []);
            setLoading(false);
        };
        fetchEditais();
    }, []);

    const filteredEditais = editais.filter(e => {
        const matchesStatus = filterStatus === 'Todos' || e.status === filterStatus;
        const matchesSearch = e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             e.descricao.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
        const date = new Date(year, month - 1, day, 12, 0, 0);
        return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Aberto': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Fechado': return 'bg-red-100 text-red-700 border-red-200';
            case 'Em Análise': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };



    return (
        <div className="min-h-screen bg-slate-50 pt-[80px] relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-20 pointer-events-none"></div>
            <SEO 
                title="Editais e Seleções" 
                description="Acompanhe as oportunidades, editais de bolsas e processos seletivos abertos do grupo de pesquisa GSIPP."
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
                        <FileText className="w-3.5 h-3.5" /> CHAMADAS ABERTAS
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1]"
                    >
                        Seleção e <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Oportunidades</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        Acesse editais de bolsas, vagas de pesquisa e outros processos seletivos do GSIPP.
                    </motion.p>
                </div>
            </section>

            {/* Search and Filters */}
            <section className="-mt-12 mb-20 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-slate-100 overflow-hidden">
                        <div className="p-2 md:p-3 flex flex-col md:flex-row gap-2">
                            <div className="relative flex-grow">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar editais por título ou descrição..."
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
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Status:</span>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 w-full">
                                {['Todos', 'Aberto', 'Em Análise', 'Fechado'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status as FilterStatus)}
                                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${filterStatus === status
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                            : 'bg-white border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* List */}
            <section className="pb-24">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={`skeleton-edital-${i}`} className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row gap-8 items-start md:items-center relative animate-pulse">
                                    <div className="flex-grow space-y-4 w-full">
                                        <div className="flex gap-3">
                                            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                                            <div className="h-6 w-32 bg-gray-100 rounded-full"></div>
                                        </div>
                                        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-full bg-gray-100 rounded"></div>
                                            <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                                        </div>
                                        <div className="h-8 w-40 bg-gray-200 rounded-xl mt-4"></div>
                                    </div>
                                    <div className="shrink-0 w-full md:w-auto pt-6 md:pt-0">
                                        <div className="h-14 w-full md:w-48 bg-gray-200 rounded-2xl"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                        {filteredEditais.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200"
                            >
                                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900">Nenhum edital encontrado</h3>
                                <p className="text-gray-500 mt-2">No momento não existem chamadas para este status.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {filteredEditais.map((edital, idx) => (
                                    <motion.div
                                        key={edital.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row gap-8 items-start md:items-center relative"
                                    >
                                        <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-3xl ${edital.status === 'Aberto' ? 'bg-emerald-500 opacity-20 group-hover:opacity-40' : 'bg-gray-300 opacity-10 group-hover:opacity-30'} transition-opacity duration-500`}></div>

                                        <div className="flex-grow space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusStyle(edital.status)}`}>
                                                    {edital.status === 'Aberto' && (
                                                        <span className="relative flex h-2 w-2">
                                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                        </span>
                                                    )}
                                                    {edital.status}
                                                </span>
                                                <span className="text-gray-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                                    <Calendar className="w-3.5 h-3.5" /> Postado em {formatDate(edital.data_abertura)}
                                                </span>
                                            </div>

                                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                {edital.titulo}
                                            </h2>

                                            <p className="text-gray-500 text-sm leading-relaxed max-w-4xl">
                                                {edital.descricao}
                                            </p>

                                            <div className="flex flex-wrap gap-6 pt-2">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 bg-gray-50 px-4 py-2 rounded-xl">
                                                    <Clock className="w-4 h-4 text-blue-600" /> Prazo: <span className="text-red-500">{formatDate(edital.data_fechamento)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-gray-50">
                                            <a
                                                href={edital.link_pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 group/btn"
                                            >
                                                Baixar Edital <FileDown className="w-5 h-5 group-hover/btn:translate-y-0.5 transition-transform" />
                                            </a>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        </AnimatePresence>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Editais;
