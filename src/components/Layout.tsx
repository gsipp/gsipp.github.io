import { Link } from 'react-router-dom';
import { Menu, X, FileText, Calendar, Users, Newspaper, Home, MapPin, Mail } from 'lucide-react';
import { GithubIcon, InstagramIcon } from './BrandIcons';
import { useState } from 'react';
import Logo from '../assets/images/gsipp-logo.svg';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navItems = [
        { name: 'Home', path: '/', icon: <Home className="w-4 h-4 mr-2" /> },
        { name: 'Membros', path: '/membros', icon: <Users className="w-4 h-4 mr-2" /> },
        { name: 'Notícias', path: '/noticias', icon: <Newspaper className="w-4 h-4 mr-2" /> },
        { name: 'Publicações', path: '/publicacoes', icon: <FileText className="w-4 h-4 mr-2" /> },
        { name: 'Eventos', path: '/eventos', icon: <Calendar className="w-4 h-4 mr-2" /> },
        { name: 'Editais', path: '/editais', icon: <FileText className="w-4 h-4 mr-2" /> },
    ];
    
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

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header / Navbar */}
            <header className="bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-[100] border-b border-gray-100/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 group">
                            <img src={Logo} alt="GSIPP Logo" className="h-12 w-auto" />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-900 leading-none">GSIPP</span>
                                <span className="text-xs text-gray-500 font-medium">UFC Crateús</span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition duration-200"
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Nav */}
                    {isMenuOpen && (
                        <nav className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center py-2 px-4 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Premium Footer */}
            <footer className="relative bg-slate-950 text-slate-400 pt-20 pb-10 overflow-hidden border-t border-white/5">
                {/* Decorative Top Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-sm"></div>

                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
                        {/* Column 1: Brand & About */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3">
                                <img src={Logo} alt="GSIPP Logo" className="h-10 w-auto grayscale brightness-200 opacity-90" />
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-white tracking-tight">GSIPP</span>
                                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">UFC Crateús</span>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-400">
                                Grupo de Excelência em Pesquisa focado em Segurança da Informação, Criptografia e Preservação da Privacidade no mundo digital.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="https://github.com/gsipp" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-500/25" title="GitHub">
                                    <GithubIcon className="w-4 h-4" />
                                </a>
                                <a href="https://www.instagram.com/gsipp_ufc/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white hover:border-pink-500 transition-all shadow-lg hover:shadow-pink-500/25" title="Instagram">
                                    <InstagramIcon className="w-4 h-4" />
                                </a>
                                <a href="https://www.researchgate.net/lab/Grupo-de-Pesquisa-em-Seguranca-da-Informacao-e-Preservacao-da-privacidade-Emerson-B-Tomaz" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/25" title="ResearchGate">
                                    <ResearchGateIcon className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Navegação</h3>
                            <ul className="space-y-3">
                                {[
                                    { name: 'Início', path: '/' },
                                    { name: 'Equipe de Pesquisa', path: '/membros' },
                                    { name: 'Linhas de Pesquisa', path: '/#linhas-pesquisa' },
                                    { name: 'Nossas Publicações', path: '/publicacoes' },
                                    { name: 'Editais e Vagas', path: '/editais' }
                                ].map((link) => (
                                    <li key={link.name}>
                                        <Link to={link.path} className="text-sm hover:text-blue-400 transition-colors flex items-center group">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Contact */}
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Contato</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <span>
                                        BR 226, KM 4 - Venâncios<br />
                                        Crateús - CE, 63700-000<br />
                                        Bloco Didático II
                                    </span>
                                </li>
                                <li className="flex items-center gap-3 text-sm">
                                    <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                                    <a href="mailto:gsipp@crateus.ufc.br" className="hover:text-white transition-colors">
                                        gsipp@crateus.ufc.br
                                    </a>
                                </li>
                                <li className="flex items-center gap-3 pt-4 border-t border-slate-800">
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        <InstagramIcon className="w-5 h-5" />
                                    </a>
                                    <a href="https://github.com/GSIPP" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                        <GithubIcon className="w-5 h-5" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-slate-500">
                            &copy; 2025 - {new Date().getFullYear()} <span className="text-slate-300 font-semibold">GSIPP</span>. Todos os direitos reservados.
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            Desenvolvido por <span className="text-white"><a href="https://github.com/VicenteNeto21" className="hover:text-blue-500 transition-colors">Vicente Neto</a></span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
