import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Mail, ChevronLeft, ExternalLink, FileDown, UserCheck, CheckCircle2, BookText, Users } from 'lucide-react';
import { LinkedinIcon } from '../components/BrandIcons';
import SEO from '../components/SEO';
import {
    formatTipo,
    getTypeStyle,
    checkIsMember,
    getExternalLinkText,
    getExternalButtonLabel,
    getPdfText,
    formatAuthorName
} from '../utils/publications';

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
}

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

const LattesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}>
        <path d="M 97.871854,434.73261 C 51.534463,339.78442 23.965602,282.44369 23.965602,281.02029 c 0,-2.32214 2.831558,-1.99974 30.672084,3.45957 48.965204,9.61389 75.126384,12.32631 118.735104,12.34258 57.69707,0.0159 104.6807,-9.1222 141.18473,-27.4842 19.31194,-9.71476 30.92555,-18.32755 40.43708,-29.99337 11.716,-14.37824 15.47977,-24.28004 15.61512,-40.94646 0.11867,-15.85237 -2.01801,-24.21167 -11.19035,-43.60874 -3.62892,-7.66433 -6.8168,-16.46265 -7.12098,-19.54964 -0.47493,-4.96814 -0.0684,-5.68084 3.59445,-6.10361 8.00292,-0.94846 47.50732,37.40224 62.05491,60.24069 25.07592,39.38574 27.11161,81.99337 5.88408,123.1953 -13.03903,25.31314 -27.44972,42.82712 -51.57723,62.73362 -40.09844,33.06211 -86.70754,56.08608 -151.06833,74.63514 C 186.61557,459.91141 130.71496,472 119.20225,472 c -2.44075,0 -7.02006,-8.00296 -21.295953,-37.28315 l -0.03402,0.0151 z M 110.77601,281.61191 C 65.760136,275.77998 27.985273,270.70947 26.81537,270.33687 24.815625,269.6926 17.660677,245.82107 13.624773,226.39004 12.607902,221.4726 11.11559,208.45131 10.30202,197.43174 6.6716589,148.26132 17.370799,114.26648 46.041165,83.697237 94.583571,31.98518 198.51713,25.694031 315.77765,67.369458 c 20.58274,7.324215 28.75504,12.410983 24.975,15.580668 -2.79708,2.339846 -21.75315,2.305883 -54.50916,-0.102387 -51.20464,-3.763759 -90.18335,3.357226 -110.27491,20.176211 -30.58742,25.60158 -25.92345,81.72365 13.53071,162.68196 4.27316,8.76586 8.57881,17.34466 9.56318,19.09094 2.28966,4.01773 0.62803,7.74899 -3.3572,7.56196 -1.69755,-0.0813 -39.91486,-4.91203 -84.92926,-10.74592 z m 151.01614,-44.04726 c -35.92814,-6.45997 -68.22691,-28.7388 -78.65437,-54.22127 -5.00209,-12.24165 -4.76437,-28.2131 0.57585,-37.77483 4.83279,-8.64723 17.3107,-18.64993 28.48481,-22.83843 18.59924,-6.96791 51.17019,-4.18853 74.90688,6.40975 22.53229,10.05487 42.50672,27.73816 49.93183,44.18457 9.52925,21.10841 1.59321,44.65955 -18.82072,55.90059 -13.5307,7.44285 -39.82676,11.32572 -56.44249,8.34109 h 0.0181 z" />
    </svg>
);

const ResearchGateIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}>
        <path d="M0 32v448h448V32H0zm262.2 334.4c-6.6 3-33.2 6-50-14.2-9.2-10.6-25.3-33.3-42.2-63.6-8.9 0-14.7 0-21.4-.6v46.4c0 23.5 6 21.2 25.8 23.9v8.1c-6.9-.3-31.1 0-35.6-.3v-8.1c9.8-.7 12-2.4 12-23.9V225c0-20.5-2.6-22.9-13.5-23.9v-8.4c3.4-.6 32.1-.3 39.3-.3 52.8 0 59.5 29.5 59.5 48.6 0 22.8-10.9 44.6-29.2 52.4l20.5 31.4c25.8 38.7 41.1 38.5 54.8 38.5v8.1zm-64.7-142.2c0-14.6-5.8-37.1-39.5-37.1h-12.7v76.8h12.1c25.6 0 40.1-15 40.1-39.7zM360 300.2h-63.5v65.6c0 15 2.1 19 12.3 19.9v7.9c-2.9-.3-24.1 0-27.9-.3v-7.9c10.3-.9 11.7-4.1 11.7-19.9v-108.5c0-15-2.1-19-12-19.9v-7.9c3.2-.3 23.8 0 28.5-.3h55.2c41.3 0 51.5 24.3 51.5 48.6 0 15.3-3.8 28.4-15 36.4l23.5 35.5c4.7 6.8 11.7 8.2 18.5 8.2v8.1c-15.3-.3-25.3-1.8-35.2-16.2l-23.1-34.6h-24.5zm0-24.3c15.8 0 24.1-11.4 24.1-27.9 0-17.6-9.1-26.4-24.1-26.4h-35.8v54.3h35.8z" />
    </svg>
);

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

const MembroPerfil = () => {
    const { id } = useParams<{ id: string }>();
    const [member, setMember] = useState<Member | null>(null);
    const [publications, setPublications] = useState<Publication[]>([]);
    const [allMembers, setAllMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemberData = async () => {
            if (!id) return;
            setLoading(true);

            // Fetch member
            const { data: memberData, error: memberError } = await supabase
                .from('membros')
                .select('*')
                .eq('id', id)
                .single();

            if (memberError) {
                console.error('Error fetching member:', memberError);
                setLoading(false);
                return;
            }

            setMember(memberData);

            // Fetch all members to use in checkIsMember
            const { data: allMembersData } = await supabase.from('membros').select('nome');
            const memberNames = (allMembersData || []).map(m => m.nome);
            setAllMembers(memberNames);

            // Fetch all publications
            const { data: pubsData } = await supabase
                .from('publicacoes')
                .select('*')
                .order('ano', { ascending: false });

            if (pubsData) {
                // Filter publications by this member
                const memberPubs = pubsData.filter(pub => checkIsMember(memberData.nome, pub.autores.split(';')));
                setPublications(memberPubs);
            }

            setLoading(false);
        };

        fetchMemberData();
    }, [id]);

    const { groupedPubs, sortedYears } = useMemo(() => {
        const grouped = publications.reduce((acc, pub) => {
            if (!acc[pub.ano]) acc[pub.ano] = [];
            acc[pub.ano].push(pub);
            return acc;
        }, {} as Record<number, Publication[]>);

        const years = Object.keys(grouped).map(Number).sort((a, b) => b - a);
        return { groupedPubs: grouped, sortedYears: years };
    }, [publications]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-[100px] flex justify-center pb-32">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mt-20"></div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-screen bg-slate-50 pt-[100px] flex flex-col items-center pb-32 text-center px-6">
                <SEO title="Membro não encontrado" />
                <h1 className="text-3xl font-bold text-slate-900 mt-20">Membro não encontrado</h1>
                <p className="text-slate-500 mt-4 mb-8">Desculpe, não conseguimos localizar este membro do GSIPP.</p>
                <Link to="/membros" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    Voltar para Equipe
                </Link>
            </div>
        );
    }

    const photoUrl = member.foto_url || getLattesPhotoUrl(member) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nome)}&background=f8fafc&color=334155&size=200`;

    return (
        <div className="min-h-screen bg-slate-50 pt-[80px]">
            <SEO title={`${member.nome} - Perfil`} description={`Conheça ${member.nome}, ${member.categoria} do grupo de pesquisa GSIPP.`} />

            {/* Back Button */}
            <div className="container mx-auto px-6 pt-8 pb-4">
                <Link to="/membros" className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Voltar para Membros
                </Link>
            </div>

            {/* Hero Profile */}
            <section className="container mx-auto px-6 mb-16">
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none opacity-60"></div>
                    
                    <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-10"></div>
                        <img 
                            src={photoUrl} 
                            alt={member.nome} 
                            className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg relative z-10"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold uppercase tracking-wider mb-4">
                            <Users className="w-4 h-4" /> {member.categoria}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                            {member.nome}
                        </h1>
                        
                        <div className="flex flex-col gap-2 mb-8">
                            <p className="text-lg text-slate-600 font-medium flex items-center justify-center md:justify-start gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> {member.area_pesquisa}
                            </p>
                            {member.curso && (
                                <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {toTitleCase(member.curso)}
                                </p>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            {member.lattes_url && (
                                <a href={member.lattes_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-all border border-blue-200 shadow-sm group">
                                    <LattesIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /> Lattes
                                </a>
                            )}
                            {member.linkedin_url && (
                                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-xl transition-all border border-sky-200 shadow-sm group">
                                    <LinkedinIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /> LinkedIn
                                </a>
                            )}
                            {member.researchgate_url && (
                                <a href={member.researchgate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl transition-all border border-emerald-200 shadow-sm group">
                                    <ResearchGateIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /> ResearchGate
                                </a>
                            )}
                            {member.email && (
                                <a href={`mailto:${member.email}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all border border-slate-200 shadow-sm group">
                                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" /> E-mail
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Publicações do Membro */}
            <section className="pb-32">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex items-center gap-3 mb-10">
                        <BookText className="w-8 h-8 text-slate-400" />
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Publicações de {member.nome.split(' ')[0]}</h2>
                    </div>

                    {publications.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                            <BookText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900">Nenhuma publicação listada</h3>
                            <p className="text-slate-500 mt-2">Este membro ainda não possui publicações cadastradas no portal.</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {sortedYears.map(year => (
                                <div key={year}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h3 className="text-2xl font-bold text-slate-900">{year}</h3>
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-4">
                                        {groupedPubs[year].map((pub, idx) => {
                                            const style = getTypeStyle(pub.tipo);
                                            return (
                                                <motion.div
                                                    key={pub.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true, margin: "-50px" }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row gap-6 relative shadow-sm"
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
                                                        
                                                        <h4 className="text-lg md:text-xl font-bold text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                                                            {pub.titulo}
                                                        </h4>
                                                        
                                                        <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed flex flex-wrap items-center gap-x-1.5 gap-y-1">
                                                            {pub.autores?.split(';').map((author, i, arr) => {
                                                                const originalAuthorName = author.trim();
                                                                if (!originalAuthorName) return null;
                                                                const authorName = formatAuthorName(originalAuthorName);
                                                                const isMem = checkIsMember(originalAuthorName, allMembers) || checkIsMember(authorName, allMembers);
                                                                // Highlight the current profile member even more
                                                                const isCurrentMember = checkIsMember(member.nome, [originalAuthorName, authorName]);
                                                                
                                                                return (
                                                                    <span key={i} className={`inline-flex items-center ${isCurrentMember ? 'text-blue-600 font-black' : isMem ? 'text-slate-800 font-bold' : ''}`}>
                                                                        {authorName}
                                                                        {isMem && !isCurrentMember && <span title="Membro do GSIPP" className="ml-1 flex items-center"><CheckCircle2 className="w-4 h-4 text-slate-400" /></span>}
                                                                        {isCurrentMember && <span title="Perfil Atual" className="ml-1 flex items-center"><UserCheck className="w-4 h-4 text-blue-500" /></span>}
                                                                        {i < arr.length - 1 ? <span className="text-slate-400 font-normal ml-0.5">;</span> : ''}
                                                                    </span>
                                                                );
                                                            })}
                                                        </p>

                                                        {(pub.orientador || pub.co_orientador) && (
                                                            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-500">
                                                                {pub.orientador && (
                                                                    <span className="flex items-center gap-1.5">
                                                                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                                                        <span className="font-bold text-slate-600">Orientador:</span> {pub.orientador.split(';').map(o => formatAuthorName(o.trim())).join('; ')}
                                                                    </span>
                                                                )}
                                                                {pub.co_orientador && (
                                                                    <span className="flex items-center gap-1.5">
                                                                        <UserCheck className="w-3.5 h-3.5 text-slate-400 opacity-70" />
                                                                        <span className="font-bold text-slate-600">Co-orientador:</span> {pub.co_orientador.split(';').map(o => formatAuthorName(o.trim())).join('; ')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Acoes Rapidas */}
                                                    <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-start md:mt-1">
                                                        {pub.link_doi && (
                                                            <a href={pub.link_doi} target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all text-sm font-semibold shadow-sm"
                                                                title={getExternalLinkText(pub.tipo)}
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                                <span className="hidden sm:inline">{getExternalButtonLabel(pub.tipo)}</span>
                                                            </a>
                                                        )}
                                                        {pub.link_pdf && (
                                                            <a href={pub.link_pdf} target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all text-sm font-semibold shadow-sm"
                                                                title={getPdfText(pub.tipo)}
                                                            >
                                                                <FileDown className="w-4 h-4" />
                                                                <span className="hidden sm:inline">PDF</span>
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
                </div>
            </section>
        </div>
    );
};

export default MembroPerfil;
