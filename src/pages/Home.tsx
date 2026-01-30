import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Fingerprint, Wifi, AlertTriangle, ArrowRight, BookOpen, Users, Globe, Calendar, Newspaper, Mail, Linkedin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import NetworkBackground from '../components/NetworkBackground';
import ufcLogo from '../assets/images/logotipo-ufc-horizontal.png';
import cnpqLogo from '../assets/images/CNPq.png';
import capesLogo from '../assets/images/capes.png';
import funcapLogo from '../assets/images/funcap.png';

const Home = () => {
    const [news, setNews] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const [loadingMembers, setLoadingMembers] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            const { data, error } = await supabase
                .from('noticias')
                .select('*')
                .order('data_publicacao', { ascending: false })
                .limit(3);

            if (error) console.error('Error fetching news:', error);
            else setNews(data || []);
            setLoadingNews(false);
        };

        const fetchMembers = async () => {
            const { data, error } = await supabase
                .from('membros')
                .select('*')
                .order('ordem', { ascending: true });

            if (error) console.error('Error fetching members:', error);
            else setMembers(data || []);
            setLoadingMembers(false);
        };

        fetchNews();
        fetchMembers();
    }, []);

    const researchLines = [
        {
            title: "Segurança Cibernética",
            description: "Proteção avançada de sistemas contra ameaças e garantia da integridade de dados.",
            icon: <Shield className="w-8 h-8 text-blue-400" />,
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "Criptografia",
            description: "Algoritmos pós-quânticos e homomórficos para a próxima geração de segurança.",
            icon: <Lock className="w-8 h-8 text-purple-400" />,
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Privacidade de Dados",
            description: "Privacidade diferencial e conformidade em ambientes distribuídos.",
            icon: <Eye className="w-8 h-8 text-emerald-400" />,
            color: "from-emerald-500 to-teal-500"
        },
        {
            title: "Identidade Digital",
            description: "Autenticação biométrica e blockchain para gestão segura de identidades.",
            icon: <Fingerprint className="w-8 h-8 text-orange-400" />,
            color: "from-orange-500 to-amber-500"
        },
        {
            title: "Segurança em IoT",
            description: "Proteção para dispositivos conectados e infraestruturas críticas.",
            icon: <Wifi className="w-8 h-8 text-cyan-400" />,
            color: "from-cyan-500 to-blue-500"
        },
        {
            title: "Análise de Vulnerabilidades",
            description: "Identificação proativa e mitigação de riscos em redes complexas.",
            icon: <AlertTriangle className="w-8 h-8 text-red-400" />,
            color: "from-red-500 to-rose-500"
        }
    ];


    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900 pt-[80px]">
            {/* Hero Section */}
            <header className="relative bg-slate-900 text-white overflow-hidden min-h-[85vh] flex items-center rounded-b-3xl mx-2 mt-2 shadow-lg shadow-blue-900/10">
                <NetworkBackground />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-900/40 pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium backdrop-blur-sm"
                    >
                        <Shield className="w-4 h-4" /> Grupo de Excelência em Pesquisa
                    </motion.div>

                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-tight"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        Segurança da Informação <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                            Preservação da Privacidade
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-12 leading-relaxed font-light"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        Pioneirismo científico e inovação tecnológica para um mundo digital mais seguro e confiável.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <a href="#linhas-pesquisa" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 z-20">
                            Nossas Pesquisas <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="#sobre" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold rounded-xl backdrop-blur-sm transition-all flex items-center justify-center z-20">
                            Conheça o Grupo
                        </a>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1, duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-gray-400"
                >
                    <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1">
                        <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
                    </div>
                </motion.div>
            </header>

            {/* Stats / Highlights Bar (Floating) */}
            <div className="container mx-auto px-6 -mt-16 relative z-20 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Users, label: "Pesquisadores", value: "Multidisciplinares" },
                        { icon: BookOpen, label: "Publicações", value: "Alto Impacto" },
                        { icon: Globe, label: "Colaboração", value: "Nacional & Internacional" }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4 border border-gray-100"
                        >
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                <p className="text-gray-900 font-bold text-lg">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Strategic Partners (Fomento) */}
            <div className="border-b border-gray-200 bg-white">
                <div className="container mx-auto px-6 py-10">
                    <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Apoio e Fomento</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                        <img
                            src={ufcLogo}
                            alt="UFC"
                            className="h-16 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        />
                        <img
                            src={cnpqLogo}
                            alt="CNPq"
                            className="h-10 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        />
                        <img
                            src={capesLogo}
                            alt="CAPES"
                            className="h-12 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        />
                        <img
                            src={funcapLogo}
                            alt="FUNCAP"
                            className="h-12 w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 mix-blend-multiply"
                        />
                    </div>
                </div>
            </div>

            {/* Sobre o Grupo */}
            <section id="sobre" className="py-20 relative overflow-hidden bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            className="lg:w-1/2"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2">Quem Somos</h2>
                            <h3 className="text-4xl font-bold text-gray-900 mb-6">Pioneirismo em Segurança e Privacidade</h3>
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                <p>
                                    Fundado em 2023 no campus de Crateús da UFC, o <span className="text-gray-900 font-semibold">GSIPP</span> é um hub de inovação que une professores, pesquisadores e alunos em torno de um objetivo comum: tornar o mundo digital mais seguro.
                                </p>
                                <p>
                                    Nossa abordagem combina rigor acadêmico com aplicabilidade prática, desenvolvendo soluções que vão desde a criptografia avançada até a proteção de dispositivos IoT no nosso cotidiano.
                                </p>
                            </div>
                        </motion.div>
                        <motion.div
                            className="lg:w-1/2 grid grid-cols-2 gap-4"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="space-y-4 mt-8">
                                <div className="bg-blue-600 h-48 rounded-2xl opacity-10 w-full transform rotate-3"></div>
                                <div className="bg-slate-900 h-64 rounded-2xl w-full shadow-lg"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-blue-100 h-64 rounded-2xl w-full"></div>
                                <div className="bg-blue-600 h-48 rounded-2xl w-full opacity-80"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Linhas de Pesquisa */}
            <section id="linhas-pesquisa" className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2">Áreas de Atuação</h2>
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">Linhas de Pesquisa</h3>
                        <p className="text-gray-600 text-lg">Exploramos as fronteiras da tecnologia para desenvolver soluções de segurança robustas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {researchLines.map((line, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${line.color} opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10`}></div>

                                <div className="mb-6 inline-block p-4 rounded-xl bg-gray-50 text-gray-900 group-hover:bg-blue-50 transition-colors">
                                    {line.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-3">{line.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{line.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coordenador */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl overflow-hidden shadow-xl text-white"
                    >
                        <div className="flex flex-col lg:flex-row">
                            <div className="lg:w-2/5 relative min-h-[400px]">
                                <img
                                    src="http://servicosweb.cnpq.br/wspessoa/servletrecuperafoto?tipo=1&id=K4254574U4"
                                    alt="Prof. Antonio Emerson"
                                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 lg:bg-gradient-to-r lg:from-transparent lg:to-slate-900/80"></div>
                            </div>
                            <div className="lg:w-3/5 p-12 lg:p-16 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium w-fit mb-6">
                                    <Users className="w-4 h-4" /> Coordenação
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-bold mb-2">Prof. Dr. Antonio Emerson Barros Tomaz</h3>
                                <p className="text-blue-300 text-lg mb-8 font-medium">Líder e Pesquisador Chefe</p>

                                <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
                                    <p>
                                        Doutor em Ciência da Computação pela UFC, com vasta experiência em Redes de Computadores e Segurança da Informação.
                                    </p>
                                    <p>
                                        Atua na graduação e pós-graduação, liderando projetos inovadores em criptografia, IoT e blockchain, moldando a próxima geração de especialistas em segurança.
                                    </p>
                                </div>

                                <div className="mt-10 pt-8 border-t border-white/10 flex gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">2007</div>
                                        <div className="text-xs text-blue-300 uppercase tracking-widest">Início Carreira</div>
                                    </div>
                                    <div className="text-center border-l border-white/10 pl-6">
                                        <div className="text-2xl font-bold text-white">CNPq</div>
                                        <div className="text-xs text-blue-300 uppercase tracking-widest">Pesquisador</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Membros Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4"
                        >
                            <Users className="w-3 h-3" /> Nosso Time
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Equipe de Pesquisa</h2>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Conheça os pesquisadores e estudantes que impulsionam a inovação em segurança e privacidade no GSIPP.
                        </p>
                    </div>

                    {loadingMembers ? (
                        <div className="flex gap-8 overflow-hidden py-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="min-w-[280px] h-96 bg-gray-50 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-20">
                            {[
                                { title: 'Corpo Docente', key: 'Docente', color: 'blue' },
                                { title: 'Mestrado', key: 'Mestrando', color: 'indigo' },
                                { title: 'Graduação', key: 'Graduação', color: 'emerald' },
                                { title: 'Egressos', key: 'Egresso', color: 'slate' }
                            ].map((cat) => {
                                const catMembers = members.filter(m => m.cargo === cat.key);
                                if (catMembers.length === 0) return null;

                                return (
                                    <div key={cat.key}>
                                        <div className="flex items-center gap-4 mb-10">
                                            <h3 className="text-2xl font-bold text-gray-900">{cat.title}</h3>
                                            <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent"></div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                            {catMembers.map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center"
                                                >
                                                    {/* Profile Image */}
                                                    <div className="relative mb-6">
                                                        <div className="w-28 h-28 rounded-full p-1 bg-white border border-gray-100 group-hover:border-blue-100 transition-colors duration-300">
                                                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                                                                {member.foto_url ? (
                                                                    <img src={member.foto_url} alt={member.nome} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-xl">
                                                                        {member.nome.substring(0, 2).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Name & Title */}
                                                    <div className="space-y-1">
                                                        <h4 className="text-lg font-bold text-gray-900">
                                                            {member.nome}
                                                        </h4>
                                                        <p className="text-gray-500 text-xs font-medium">
                                                            {member.area_pesquisa || member.cargo}
                                                        </p>
                                                    </div>

                                                    {/* Social Links */}
                                                    <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-50 w-full text-gray-400 transition-colors">
                                                        {member.lattes_url && (
                                                            <a href={member.lattes_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors" title="Currículo Lattes">
                                                                <BookOpen className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        {member.linkedin_url && (
                                                            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors" title="LinkedIn">
                                                                <Linkedin className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        {member.email && (
                                                            <a href={`mailto:${member.email}`} className="hover:text-red-500 transition-colors" title="Enviar E-mail">
                                                                <Mail className="w-4 h-4" />
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
                    )}
                </div>
            </section>

            {/* Latest News (Novidades) */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-2">Atualizações</h2>
                            <h3 className="text-3xl font-bold text-gray-900">Notícias e Publicações</h3>
                        </div>
                        <a href="/noticias" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition">
                            Ver todas <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {loadingNews ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-96 animate-pulse"></div>
                            ))
                        ) : news.map((item, index) => (
                            <Link
                                key={item.id}
                                to={`/noticias/${item.slug}`}
                                className="block"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer flex flex-col"
                                >
                                    <div className="aspect-[4/5] overflow-hidden relative bg-gray-100">
                                        {item.imagem_capa_url ? (
                                            <img
                                                src={item.imagem_capa_url}
                                                alt={item.titulo}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Newspaper className="w-16 h-16" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 uppercase">
                                            Notícia
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="flex items-center text-gray-400 text-sm mb-3">
                                            <Calendar className="w-3 h-3 mr-1" /> {(() => {
                                                const [year, month, day] = item.data_publicacao.split('T')[0].split('-').map(Number);
                                                return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('pt-BR', {
                                                    timeZone: 'America/Sao_Paulo',
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                });
                                            })()}
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {item.titulo}
                                        </h4>
                                        <p className="text-gray-600 mb-6 line-clamp-3">
                                            {item.resumo}
                                        </p>
                                        <div className="mt-auto inline-flex items-center text-sm font-semibold text-gray-900 hover:text-blue-600 transition">
                                            Ler mais <ArrowRight className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section >
        </div >
    );
};

export default Home;
