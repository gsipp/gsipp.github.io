import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Users, BookOpen, Mail, Linkedin } from 'lucide-react';

interface Member {
    id: string;
    nome: string;
    cargo: string;
    area_pesquisa: string;
    lattes_url: string;
    linkedin_url: string;
    foto_url: string;
    email: string;
    ordem: number;
}

const Membros = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            const { data, error } = await supabase
                .from('membros')
                .select('*')
                .order('ordem', { ascending: true });

            if (error) console.error('Error fetching members:', error);
            else setMembers(data || []);
            setLoading(false);
        };
        fetchMembers();
    }, []);

    const categories = [
        { title: 'Corpo Docente', key: 'Docente', color: 'blue', text: 'text-blue-600', border: 'border-blue-100', bg: 'bg-blue-50/30' },
        { title: 'Mestrado', key: 'Mestrando', color: 'indigo', text: 'text-indigo-600', border: 'border-indigo-100', bg: 'bg-indigo-50/30' },
        { title: 'Graduação', key: 'Graduação', color: 'emerald', text: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50/30' },
        { title: 'Egressos', key: 'Egresso', color: 'slate', text: 'text-slate-600', border: 'border-slate-100', bg: 'bg-slate-50/30' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Carregando pesquisadores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[80px]">
            {/* Header / Hero Section */}
            <section className="relative bg-slate-900 pt-32 pb-24 overflow-hidden rounded-b-3xl mx-2 mt-2 shadow-lg shadow-blue-900/10">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900 to-slate-900"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold uppercase tracking-widest mb-6"
                    >
                        <Users className="w-4 h-4" /> Nosso Time
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        Membros do <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">GSIPP</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg max-w-3xl leading-relaxed"
                    >
                        Conheça os pesquisadores, estudantes e profissionais que compõem nosso grupo e impulsionam a inovação em segurança e privacidade.
                    </motion.p>
                </div>
            </section>

            {/* Categorized Members Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="space-y-32">
                        {categories.map((cat) => {
                            const catMembers = members.filter(m => m.cargo === cat.key);
                            if (catMembers.length === 0) return null;

                            return (
                                <div key={cat.key}>
                                    <div className="flex items-center gap-6 mb-12">
                                        <div className={`w-12 h-12 rounded-2xl ${cat.bg} ${cat.text} flex items-center justify-center`}>
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900">{cat.title}</h2>
                                            <p className="text-gray-500 text-sm">{catMembers.length} {catMembers.length === 1 ? 'membro' : 'membros'}</p>
                                        </div>
                                        <div className="flex-grow h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                                        {catMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center"
                                            >
                                                {/* Profile Photo Area */}
                                                <div className="relative mb-6">
                                                    <div className="w-28 h-28 rounded-full p-1 bg-white border border-gray-100 group-hover:border-blue-100 transition-colors duration-300">
                                                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                                                            {member.foto_url ? (
                                                                <img src={member.foto_url} alt={member.nome} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-2xl`}>
                                                                    {member.nome.substring(0, 2).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="w-full space-y-2">
                                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                                        {member.nome}
                                                    </h3>
                                                    <p className="text-gray-500 text-sm font-medium">
                                                        {member.area_pesquisa || member.cargo}
                                                    </p>
                                                </div>

                                                {/* Action/Social Footer */}
                                                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-50 w-full">
                                                    {member.lattes_url && (
                                                        <a href={member.lattes_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Currículo Lattes">
                                                            <BookOpen className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                    {member.linkedin_url && (
                                                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors" title="LinkedIn">
                                                            <Linkedin className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                    {member.email && (
                                                        <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-red-500 transition-colors" title="Enviar E-mail">
                                                            <Mail className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Membros;
