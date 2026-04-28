import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, FileDown, AlertCircle, Clock, Activity } from 'lucide-react';
import SEO from '../components/SEO';
import NetworkBackground from '../components/NetworkBackground';

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

    const filteredEditais = editais.filter(e => filterStatus === 'Todos' || e.status === filterStatus);

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
        <div className="min-h-screen bg-gray-50 pt-[80px]">
            <SEO 
                title="Editais e Seleções" 
                description="Acompanhe as oportunidades, editais de bolsas e processos seletivos abertos do grupo de pesquisa GSIPP."
            />
            {/* Header */}
            <section className="relative bg-slate-900 pt-32 pb-24 overflow-hidden rounded-b-3xl mx-2 mt-2">
                <NetworkBackground />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/90 to-slate-900 pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-sm"
                        >
                            <FileText className="w-4 h-4" /> Chamadas Abertas
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
                        >
                            Seleção e <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Oportunidades</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-lg max-w-2xl leading-relaxed"
                        >
                            Acesse editais de bolsas, vagas de pesquisa e outros processos seletivos do GSIPP.
                        </motion.p>
                    </div>

                    {/* Quick Stats for Editais */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-6 mt-8 md:mt-0"
                    >
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 min-w-[140px]">
                            <div className="text-emerald-400 mb-2"><Activity className="w-6 h-6" /></div>
                            <div className="text-3xl font-bold text-white mb-1">
                                {loading ? '-' : editais.filter(e => e.status === 'Aberto').length}
                            </div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Vagas Abertas</div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="-mt-10 mb-16 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 flex flex-wrap justify-center gap-4">
                        {['Todos', 'Aberto', 'Em Análise', 'Fechado'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as FilterStatus)}
                                className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all ${filterStatus === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
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
