import { Link } from 'react-router-dom';
import { Menu, X, Shield, FileText, Calendar, Users, Newspaper, Home, MapPin, Mail, Github, Linkedin } from 'lucide-react';
import { useState } from 'react';
import Logo from '../assets/images/gsipp-logo.svg';

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
                                <a href="#" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-500/25">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a href="#" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-500/25">
                                    <LattesIcon className="w-4 h-4" />
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
                                    <a href="mailto:contato@gsipp.ufc.br" className="hover:text-white transition-colors">
                                        contato@gsipp.ufc.br
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-slate-500">
                            &copy; {new Date().getFullYear()} <span className="text-slate-300 font-semibold">GSIPP</span>. Todos os direitos reservados.
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            Desenvolvido com <span className="text-blue-500">⚡</span> na UFC Crateús
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
