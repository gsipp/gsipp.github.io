import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Users, Search, Mail, Filter, ArrowRight } from 'lucide-react';
import { LinkedinIcon } from '../components/BrandIcons';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Dropdown from '../components/Dropdown';

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

const ResearchGateIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        fill="currentColor"
        className={className}
    >
        <path d="M0 32v448h448V32H0zm262.2 334.4c-6.6 3-33.2 6-50-14.2-9.2-10.6-25.3-33.3-42.2-63.6-8.9 0-14.7 0-21.4-.6v46.4c0 23.5 6 21.2 25.8 23.9v8.1c-6.9-.3-31.1 0-35.6-.3v-8.1c9.8-.7 12-2.4 12-23.9V225c0-20.5-2.6-22.9-13.5-23.9v-8.4c3.4-.6 32.1-.3 39.3-.3 52.8 0 59.5 29.5 59.5 48.6 0 22.8-10.9 44.6-29.2 52.4l20.5 31.4c25.8 38.7 41.1 38.5 54.8 38.5v8.1zm-64.7-142.2c0-14.6-5.8-37.1-39.5-37.1h-12.7v76.8h12.1c25.6 0 40.1-15 40.1-39.7zM360 300.2h-63.5v65.6c0 15 2.1 19 12.3 19.9v7.9c-2.9-.3-24.1 0-27.9-.3v-7.9c10.3-.9 11.7-4.1 11.7-19.9v-108.5c0-15-2.1-19-12-19.9v-7.9c3.2-.3 23.8 0 28.5-.3h55.2c41.3 0 51.5 24.3 51.5 48.6 0 15.3-3.8 28.4-15 36.4l23.5 35.5c4.7 6.8 11.7 8.2 18.5 8.2v8.1c-15.3-.3-25.3-1.8-35.2-16.2l-23.1-34.6h-24.5zm0-24.3c15.8 0 24.1-11.4 24.1-27.9 0-17.6-9.1-26.4-24.1-26.4h-35.8v54.3h35.8z" />
    </svg>
);

interface Member {
    id: string;
    nome: string;
    cargo: string;
    categoria: string;
    area_pesquisa: string;
    curso: string;
    lattes_url: string;
    lattes_id: string;
    linkedin_url: string;
    foto_url: string;
    researchgate_url?: string;
    email: string;
    ordem: number;
    foto_posicao?: string;
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

const toTitleCase = (str: string) => {
    if (!str) return '';
    const lowercaseWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos'];
    return str.toLowerCase().split(' ').map((word, index) => {
        if (index > 0 && lowercaseWords.includes(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
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
            <section className="-mt-12 mb-16 relative z-20">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="bg-white rounded-2xl border border-slate-200 p-2 md:p-3 flex flex-col md:flex-row gap-3 items-center group focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                        <div className="relative flex-grow w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou área de pesquisa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-transparent border-none rounded-xl outline-none text-slate-800 text-lg font-medium placeholder:text-slate-400"
                            />
                        </div>
                        <div className="relative w-full md:w-[260px]">
                            <Dropdown
                                value={selectedArea}
                                onChange={setSelectedArea}
                                options={[
                                    { label: 'Todas as Áreas', value: 'Todas' },
                                    ...allAreas.map(area => ({ label: area, value: area }))
                                ]}
                                icon={<Filter className="w-4 h-4" />}
                            />
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={`skeleton-card-${i}`} className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col items-center text-center animate-pulse">
                                                <div className="w-24 h-24 rounded-full bg-slate-200 mb-5"></div>
                                                <div className="h-5 w-3/4 bg-slate-200 rounded mb-2"></div>
                                                <div className="h-4 w-1/2 bg-slate-100 rounded mb-5"></div>
                                                <div className="flex gap-4 w-full justify-center pt-5 border-t border-slate-100">
                                                    <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                                                    <div className="w-5 h-5 rounded-full bg-slate-200"></div>
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
                                    // Accept both 'Graduação' and 'Graduando' for the undergraduate section
                                    if (cat.key === 'Graduação') {
                                        if (m.cargo !== 'Graduação' && m.cargo !== 'Graduando') return false;
                                    } else {
                                        if (m.cargo !== cat.key) return false;
                                    }

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
                                                    viewport={{ once: true, margin: "-50px" }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition-all duration-300 flex flex-col items-center text-center"
                                                >
                                                    {/* Profile Photo Area */}
                                                    <Link to={`/membros/${member.id}`} className="flex flex-col items-center w-full group/link">
                                                        <div className="relative mb-5">
                                                            <div className="w-24 h-24 rounded-full p-1 bg-white border border-slate-200 group-hover:border-blue-200 transition-colors duration-300">
                                                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                                                                    {member.foto_url ? (
                                                                        <img 
                                                                            src={member.foto_url} 
                                                                            alt={member.nome} 
                                                                            className="w-full h-full object-cover group-hover/link:scale-110 transition-transform duration-500" 
                                                                            style={{ objectPosition: member.foto_posicao || 'center center' }}
                                                                        />
                                                                    ) : getLattesPhotoUrl(member) ? (
                                                                        <img 
                                                                            src={getLattesPhotoUrl(member)!} 
                                                                            alt={member.nome} 
                                                                            className="w-full h-full object-cover group-hover/link:scale-110 transition-transform duration-500" 
                                                                            style={{ objectPosition: member.foto_posicao || 'center center' }}
                                                                        />
                                                                    ) : (
                                                                        <div className={`w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-2xl`}>
                                                                            {member.nome.substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Details */}
                                                        <div className="w-full space-y-1.5 flex-grow">
                                                            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover/link:text-blue-600 transition-colors">
                                                                {member.nome}
                                                            </h3>
                                                            <p className="text-slate-600 text-sm font-medium">
                                                                {member.area_pesquisa || member.cargo}
                                                            </p>
                                                            {member.curso && (
                                                                <p className="text-slate-500 text-xs font-semibold">
                                                                    {toTitleCase(member.curso)}
                                                                </p>
                                                            )}
                                                            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1">
                                                                    Ver Perfil <ArrowRight className="w-3 h-3" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>

                                                    {/* Action/Social Footer */}
                                                    <div className="flex items-center justify-center gap-4 mt-5 pt-5 border-t border-slate-100 w-full">
                                                        {member.lattes_url && (
                                                            <a href={member.lattes_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Currículo Lattes">
                                                                <LattesIcon className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                        {member.linkedin_url && (
                                                            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors" title="LinkedIn">
                                                                <LinkedinIcon className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                        {member.researchgate_url && (
                                                            <a href={member.researchgate_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-500 transition-colors" title="ResearchGate">
                                                                <ResearchGateIcon className="w-5 h-5" />
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
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <Search className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Nenhum pesquisador encontrado</h3>
                                        <p className="text-slate-500">Tente ajustar seus termos de busca ou filtros.</p>
                                        <button
                                            onClick={() => { setSearchTerm(''); setSelectedArea('Todas'); }}
                                            className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
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
