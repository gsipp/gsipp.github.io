import { Link } from 'react-router-dom';
import { Menu, X, Shield, FileText, Calendar, Users, Newspaper, Home } from 'lucide-react';
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
        { name: 'Admin', path: '/admin', icon: <Shield className="w-4 h-4 mr-2" /> },
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

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">GSIPP</h3>
                        <p className="text-sm leading-relaxed mb-4">
                            Grupo de Pesquisa em Segurança da Informação e Preservação da Privacidade.
                            <br />
                            Universidade Federal do Ceará - Campus Crateús.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contato</h3>
                        <p className="flex items-center mb-2">
                            <span className="bg-gray-800 p-2 rounded-full mr-3">📧</span>
                            contato@gsipp.ufc.br
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Links Rápidos</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/membros" className="hover:text-blue-400 transition">Nossos Membros</Link></li>
                            <li><Link to="/publicacoes" className="hover:text-blue-400 transition">Últimas Publicações</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} GSIPP. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
