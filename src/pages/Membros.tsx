import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Users, Mail, Linkedin, Activity, Target, Search, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import NetworkBackground from '../components/NetworkBackground';

const LattesIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 448 512" 
        fill="currentColor" 
        className={className}
    >
        <path d="M 97.871854,434.73261 C 51.534463,339.78442 23.965602,282.44369 23.965602,281.02029 c 0,-2.32214 2.831558,-1.99974 30.672084,3.45957 48.965204,9.61389 75.126384,12.32631 118.735104,12.34258 57.69707,0.0159 104.6807,-9.1222 141.18473,-27.4842 19.31194,-9.71476 30.92555,-18.32755 40.43708,-29.99337 11.716,-14.37824 15.47977,-24.28004 15.61512,-40.94646 0.11867,-15.85237 -2.01801,-24.21167 -11.19035,-43.60874 -3.62892,-7.66433 -6.8168,-16.46265 -7.12098,-19.54964 -0.47493,-4.96814 -0.0684,-5.68084 3.59445,-6.10361 8.00292,-0.94846 47.50732,37.40224 62.05491,60.24069 25.07592,39.38574 27.11161,81.99337 5.88408,123.1953 -13.03903,25.31314 -27.44972,42.82712 -51.57723,62.73362 -40.09844,33.06211 -86.70754,56.08608 -151.06833,74.63514 C 186.61557,459.91141 130.71496,472 119.20225,472 c -2.44075,0 -7.02006,-8.00296 -21.295953,-37.28315 l -0.03402,0.0151 z M 110.77601,281.61191 C 65.760136,275.77998 27.985273,270.70947 26.81537,270.33687 24.815625,269.6926 17.660677,245.82107 13.624773,226.39004 12.607902,221.4726 11.11559,208.45131 10.30202,197.43174 6.6716589,148.26132 17.370799,114.26648 46.041165,83.697237 94.583571,31.98518 198.51713,25.694031 315.77765,67.369458 c 20.58274,7.324215 28.75504,12.410983 24.975,15.580668 -2.79708,2.339846 -21.75315,2.305883 -54.50916,-0.102387 -51.20464,-3.763759 -90.18335,3.357226 -110.27491,20.176211 -30.58742,25.60158 -25.92345,81.72365 13.53071,162.68196 4.27316,8.76586 8.57881,17.34466 9.56318,19.09094 2.28966,4.01773 0.62803,7.74899 -3.3572,7.56196 -1.69755,-0.0813 -39.91486,-4.91203 -84.92926,-10.74592 z m 151.01614,-44.04726 c -35.92814,-6.45997 -68.22691,-28.7388 -78.65437,-54.22127 -5.00209,-12.24165 -4.76437,-28.2131 0.57585,-37.77483 4.83279,-8.64723 17.3107,-18.64993 28.48481,-22.83843 18.59924,-6.96791 51.17019,-4.18853 74.90688,6.40975 22.53229,10.05487 42.50672,27.73816 49.93183,44.18457 9.52925,21.10841 1.59321,44.65955 -18.82072,55.90059 -13.5307,7.44285 -39.82676,11.32572 -56.44249,8.34109 h 0.0181 z" />
    </svg>
);

interface Member {
    id: string;
    nome: string;
    cargo: string;
    area_pesquisa: string;
    curso: string;
    lattes_url: string;
    lattes_id: string;
    linkedin_url: string;
    foto_url: string;
    email: string;
    ordem: number;
}

const getLattesPhotoUrl = (member: Member): string | null => {
    if (member.lattes_id) {
        return `https://servicosweb.cnpq.br/wspessoa/servletrecuperafoto?tipo=1&id=${member.lattes_id}`;
    }
    if (!member.lattes_url) return null;
    const match = member.lattes_url.match(/(?:lattes|buscatextual)\.cnpq\.br\/(\w+)/i);
    if (match && match[1]) {
        return `https://servicosweb.cnpq.br/wspessoa/servletrecuperafoto?tipo=1&id=${match[1]}`;
    }
    return null;
};

const Membros = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('Todas');

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

    const allAreas = Array.from(new Set(members.map(m => m.area_pesquisa).filter(Boolean)));



    return (
        <div className="min-h-screen bg-slate-50 pt-[80px] relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')] opacity-20 pointer-events-none"></div>
            <SEO 
                title="Equipe de Pesquisa" 
                description="Conheça os doutores, mestrandos e pesquisadores do GSIPP que lideram a inovação em segurança cibernética e privacidade."
            />
            {/* Header / Hero Section */}
            <section className="relative bg-slate-900 pt-24 pb-48 overflow-hidden rounded-b-[4rem] mx-2 mt-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-600/20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-sm mx-auto"
                    >
                        <Users className="w-3.5 h-3.5" /> NOSSO TIME
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1]"
                    >
                        Membros do <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">GSIPP</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        Conheça os pesquisadores, estudantes e profissionais que compõem nosso grupo e impulsionam a inovação em segurança e privacidade.
                    </motion.p>
                </div>
            </section>

            {/* Search and Filter Section */}
            <section className="-mt-12 mb-20 relative z-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-3 md:p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome ou tecnologia..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-300"
                            />
                        </div>
                        <div className="relative w-full md:w-auto min-w-[200px]">
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white z-10 pointer-events-none" />
                            <select
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                                className="w-full pl-14 pr-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all outline-none appearance-none cursor-pointer shadow-lg shadow-slate-900/20"
                            >
                                <option value="Todas">TODAS AS ÁREAS</option>
                                {allAreas.map(area => (
                                    <option key={area} value={area} className="bg-white text-slate-900 font-bold uppercase">{area.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categorized Members Section */}
            <section className="pb-20">
                <div className="container mx-auto px-6">
                    {loading ? (
                        /* Skeleton Loading State */
                        <div className="space-y-32">
                            {[1, 2].map((groupIndex) => (
                                <div key={`skeleton-group-${groupIndex}`}>
                                    <div className="flex items-center gap-6 mb-12 animate-pulse">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
                                        <div className="space-y-2">
                                            <div className="h-8 w-48 bg-gray-200 rounded"></div>
                                            <div className="h-4 w-24 bg-gray-100 rounded"></div>
                                        </div>
                                        <div className="flex-grow h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={`skeleton-card-${i}`} className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center text-center animate-pulse">
                                                <div className="w-28 h-28 rounded-full bg-gray-200 mb-6"></div>
                                                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-4 w-1/2 bg-gray-100 rounded mb-6"></div>
                                                <div className="flex gap-4 w-full justify-center pt-6 border-t border-gray-50">
                                                    <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                                                    <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-32">
                            {categories.map((cat) => {
                                const catMembers = members.filter(m => {
                                    if (m.cargo !== cat.key) return false;
                                    
                                    const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                          (m.area_pesquisa && m.area_pesquisa.toLowerCase().includes(searchTerm.toLowerCase()));
                                    const matchesArea = selectedArea === 'Todas' || m.area_pesquisa === selectedArea;
                                    
                                    return matchesSearch && matchesArea;
                                });

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

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                                            {catMembers.map((member, idx) => (
                                                <motion.div
                                                    key={member.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center shadow-sm hover:shadow-md"
                                                >
                                                    {/* Profile Photo Area */}
                                                    <div className="relative mb-6">
                                                        <div className="w-28 h-28 rounded-full p-1 bg-white border border-gray-100 group-hover:border-blue-100 transition-colors duration-300">
                                                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                                                                {member.foto_url ? (
                                                                    <img src={member.foto_url} alt={member.nome} className="w-full h-full object-cover" />
                                                                ) : getLattesPhotoUrl(member) ? (
                                                                    <img src={getLattesPhotoUrl(member)!} alt={member.nome} className="w-full h-full object-cover" />
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
                                                        {member.curso && (
                                                            <p className="text-gray-400 text-sm italic font-medium">
                                                                {member.curso}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Action/Social Footer */}
                                                    <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-50 w-full">
                                                        {member.lattes_url && (
                                                            <a href={member.lattes_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Currículo Lattes">
                                                                <LattesIcon className="w-5 h-5" />
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
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Empty State when search yields no results */}
                            {!loading && members.length > 0 && categories.every(cat => 
                                members.filter(m => m.cargo === cat.key && 
                                    (m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || (m.area_pesquisa && m.area_pesquisa.toLowerCase().includes(searchTerm.toLowerCase()))) &&
                                    (selectedArea === 'Todas' || m.area_pesquisa === selectedArea)
                                ).length === 0
                            ) && (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum pesquisador encontrado</h3>
                                    <p className="text-gray-500">Tente ajustar seus termos de busca ou filtros.</p>
                                    <button 
                                        onClick={() => { setSearchTerm(''); setSelectedArea('Todas'); }}
                                        className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition"
                                    >
                                        Limpar Filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action - Join the Lab */}
            <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Quer fazer parte da equipe?</h2>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Estamos sempre em busca de mentes brilhantes interessadas em segurança cibernética e privacidade. Fique de olho em nossos processos seletivos.
                    </p>
                    <Link to="/editais" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
                        Ver Editais Abertos <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Membros;
