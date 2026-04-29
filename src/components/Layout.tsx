import { Link } from 'react-router-dom';
import { Menu, X, FileText, Calendar, Users, Newspaper, Home, MapPin, Mail, Github } from 'lucide-react';
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
                                <a href="https://github.com/gsipp" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-500/25">
                                    <Github className="w-4 h-4" />
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
