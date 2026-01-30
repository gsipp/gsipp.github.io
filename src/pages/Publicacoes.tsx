import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { BookText, ExternalLink, FileDown, Search, Filter, Calendar } from 'lucide-react';

interface Publication {
    id: string;
    titulo: string;
    ano: number;
    autores: string;
    veiculo: string;
    link_doi: string;
    link_pdf: string;
}

const Publicacoes = () => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'Todos'>('Todos');

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
        const matchesSearch = pub.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.autores.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.veiculo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesYear = selectedYear === 'Todos' || pub.ano === selectedYear;
        return matchesSearch && matchesYear;
    });

    const years = ['Todos', ...Array.from(new Set(publications.map(p => p.ano)))].sort((a, b) => {
        if (a === 'Todos') return -1;
        if (b === 'Todos') return 1;
        return (b as number) - (a as number);
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando publicações...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[80px]">
            {/* Header */}
            <section className="relative bg-slate-900 pt-32 pb-24 overflow-hidden rounded-b-3xl mx-2 mt-2 shadow-lg shadow-blue-900/10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-10"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6"
                    >
                        <BookText className="w-4 h-4" /> Produção Acadêmica
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        Publicações de <span className="text-blue-400">Impacto</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg max-w-2xl leading-relaxed"
                    >
                        Explore nosso acervo de artigos científicos, conferências e periódicos que contribuem para o avanço da segurança cibernética mundial.
                    </motion.p>
                </div>
            </section>

            {/* Filters */}
            <section className="-mt-10 mb-16 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col lg:flex-row gap-6 items-center">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por título, autores ou veículo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-700"
                            />
                        </div>
                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <Filter className="text-gray-400 w-5 h-5 hidden sm:block" />
                            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar w-full lg:w-auto">
                                {years.slice(0, 6).map(year => (
                                    <button
                                        key={year}
                                        onClick={() => setSelectedYear(year as any)}
                                        className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${selectedYear === year
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
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
                    <div className="space-y-6">
                        {filteredPublications.map((pub, idx) => (
                            <motion.div
                                key={pub.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx % 10 * 0.05 }}
                                className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col md:flex-row gap-8 items-start md:items-center"
                            >
                                {/* Year Badge */}
                                <div className="flex-shrink-0 w-20 h-20 rounded-3xl bg-blue-50 flex flex-col items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
                                    <Calendar className="w-5 h-5 text-blue-600 group-hover:text-white mb-1" />
                                    <span className="text-lg font-black text-blue-900 group-hover:text-white leading-none">{pub.ano}</span>
                                </div>

                                {/* Main Content */}
                                <div className="flex-grow space-y-3">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {pub.titulo}
                                    </h2>
                                    <div className="flex flex-wrap gap-2 items-center text-gray-500 font-medium">
                                        <span className="text-gray-900">{pub.autores}</span>
                                        <span className="hidden md:inline">•</span>
                                        <span className="italic text-blue-600/70">{pub.veiculo}</span>
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="flex-shrink-0 flex gap-3 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-gray-100">
                                    {pub.link_doi && (
                                        <a
                                            href={pub.link_doi}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl hover:bg-slate-900 hover:text-white transition-all duration-300 group/link"
                                        >
                                            DOI <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                        </a>
                                    )}
                                    {pub.link_pdf && (
                                        <a
                                            href={pub.link_pdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300"
                                        >
                                            PDF <FileDown className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Publicacoes;
