import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, FileDown, AlertCircle, Clock } from 'lucide-react';

interface Edital {
    id: string;
    titulo: string;
    descricao: string;
    link_pdf: string;
    data_abertura: string;
    data_fechamento: string;
    status: string;
}

const Editais = () => {
    const [editais, setEditais] = useState<Edital[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'Todos' | 'Aberto' | 'Fechado' | 'Em Análise'>('Todos');

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
        const date = new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`);
        return date.toLocaleDateString('pt-BR');
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Aberto': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Fechado': return 'bg-red-100 text-red-700 border-red-200';
            case 'Em Análise': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando editais...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[80px]">
            {/* Header */}
            <section className="relative bg-slate-900 pt-32 pb-24 overflow-hidden rounded-b-3xl mx-2 mt-2 shadow-lg shadow-blue-900/10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-10"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6"
                    >
                        <FileText className="w-4 h-4" /> Chamadas Abertas
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        Seleção e <span className="text-blue-400">Oportunidades</span>
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
            </section>

            {/* Filters */}
            <section className="-mt-10 mb-16 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 flex flex-wrap justify-center gap-4">
                        {['Todos', 'Aberto', 'Em Análise', 'Fechado'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status as any)}
                                className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all ${filterStatus === status
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
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
                <div className="container mx-auto px-6 max-w-5xl">
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
                                        className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row gap-8 items-start md:items-center relative"
                                    >
                                        <div className={`absolute top-0 left-0 w-2 h-full rounded-l-[2.5rem] ${edital.status === 'Aberto' ? 'bg-emerald-500' : 'bg-gray-300'} opacity-30`}></div>

                                        <div className="flex-grow space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(edital.status)}`}>
                                                    {edital.status}
                                                </span>
                                                <span className="text-gray-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest">
                                                    <Calendar className="w-3.5 h-3.5" /> Postado em {formatDate(edital.data_abertura)}
                                                </span>
                                            </div>

                                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                                                {edital.titulo}
                                            </h2>

                                            <p className="text-gray-500 text-sm leading-relaxed max-w-3xl">
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
                </div>
            </section>
        </div>
    );
};

export default Editais;
