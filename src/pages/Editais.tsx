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
            case 'Aberto': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Fechado': return 'bg-red-50 text-red-700 border-red-200';
            case 'Em Análise': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
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
            <section className="-mt-12 mb-16 relative z-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bg-white rounded-2xl border border-slate-200 p-2 md:p-3 flex flex-col gap-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                        {/* Search Input */}
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar editais por título ou descrição..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-transparent border-none rounded-xl outline-none text-slate-800 text-lg font-medium placeholder:text-slate-400"
                            />
                        </div>

                        {/* Status Filters */}
                        <div className="flex flex-wrap items-center gap-2 px-3 pb-2 pt-2 border-t border-slate-50">
                            <Filter className="w-4 h-4 text-slate-400 mr-2" />
                            {['Todos', 'Aberto', 'Em Análise', 'Fechado'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status as FilterStatus)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filterStatus === status
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* List */}
            <section className="pb-24">
                <div className="container mx-auto px-6">
                    {loading ? (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            {[1, 2, 3].map(i => (
                                <div key={`skeleton-edital-${i}`} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center animate-pulse">
                                    <div className="flex-grow space-y-3 w-full">
                                        <div className="flex gap-2">
                                            <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
                                            <div className="h-6 w-32 bg-slate-100 rounded-md"></div>
                                        </div>
                                        <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                                        <div className="space-y-1.5">
                                            <div className="h-4 w-full bg-slate-100 rounded"></div>
                                            <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 w-full md:w-auto pt-4 md:pt-0">
                                        <div className="h-12 w-full md:w-40 bg-slate-200 rounded-xl"></div>
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
                                className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-4xl mx-auto"
                            >
                                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900">Nenhum edital encontrado</h3>
                                <p className="text-slate-500 mt-2">No momento não existem chamadas para este status ou termo.</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-4 max-w-4xl mx-auto">
                                {filteredEditais.map((edital, idx) => (
                                    <motion.div
                                        key={edital.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 left-0 w-1 h-full ${edital.status === 'Aberto' ? 'bg-emerald-500' : 'bg-transparent'} transition-colors duration-500`}></div>

                                        <div className="flex-grow space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getStatusStyle(edital.status)}`}>
                                                    {edital.status === 'Aberto' && (
                                                        <span className="relative flex h-1.5 w-1.5">
                                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                                        </span>
                                                    )}
                                                    {edital.status}
                                                </span>
                                                <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                                    <Calendar className="w-3.5 h-3.5" /> Postado em {formatDate(edital.data_abertura)}
                                                </span>
                                            </div>

                                            <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                                                {edital.titulo}
                                            </h2>

                                            <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
                                                {edital.descricao}
                                            </p>

                                            <div className="flex flex-wrap gap-4 pt-1">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                    <Clock className="w-3.5 h-3.5 text-blue-500" /> Prazo: <span className="text-slate-800">{formatDate(edital.data_fechamento)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                            <a
                                                href={edital.link_pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all group/btn"
                                            >
                                                Baixar Edital <FileDown className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
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
