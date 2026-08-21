import { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, Users, Newspaper, LogOut, LayoutDashboard, 
    Calendar, UserCog, BookOpen, ClipboardList, Settings, 
    Menu, X 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminLayout = () => {
    const { user, loading, signOut } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on route change (for mobile)
    useEffect(() => {
        // eslint-disable-next-line
        setIsSidebarOpen(false);
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/gestao-gsipp/login" replace />;
    }

    const navItems = [
        { path: '/gestao-gsipp', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/gestao-gsipp/membros', icon: Users, label: 'Membros' },
        { path: '/gestao-gsipp/noticias', icon: Newspaper, label: 'Notícias' },
        { path: '/gestao-gsipp/publicacoes', icon: BookOpen, label: 'Publicações' },
        { path: '/gestao-gsipp/eventos', icon: Calendar, label: 'Eventos' },
        { path: '/gestao-gsipp/editais', icon: ClipboardList, label: 'Editais' },
        { path: '/gestao-gsipp/configuracoes', icon: Settings, label: 'Configurações' },
        { path: '/gestao-gsipp/perfil', icon: UserCog, label: 'Meu Perfil' },
    ];

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Mobile Header - Glassmorphism */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl text-white px-6 z-50 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-lg tracking-tighter">GSIPP <span className="text-blue-500">ADMIN</span></span>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                    aria-label="Toggle Menu"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Sidebar Overlay (Mobile) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Premium Design */}
            <aside className={`
                w-72 bg-slate-950 text-white flex flex-col fixed h-full z-50 shadow-[20px_0_50px_-15px_rgba(0,0,0,0.5)] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-8 border-b border-white/5 hidden lg:block">
                    <div className="flex items-center gap-4 group">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-2xl tracking-tighter leading-none">GSIPP</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Painel de Gestão</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Header Spacer */}
                <div className="h-16 lg:hidden" />

                <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm group ${
                                    isActive
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-pill"
                                            className="absolute inset-0 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={`w-5 h-5 shrink-0 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span className="relative z-10">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4">
                    <NavLink 
                        to="/gestao-gsipp/perfil"
                        className={({ isActive }) => 
                            `flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300 group ${
                                isActive 
                                    ? 'bg-blue-600/10 border-blue-500/20' 
                                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                            }`
                        }
                    >
                        <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center font-black text-blue-400 border border-white/10 shrink-0 group-hover:scale-105 transition-transform overflow-hidden bg-center bg-cover"
                             style={user?.user_metadata?.avatar_url ? { backgroundImage: `url(${user.user_metadata.avatar_url})` } : {}}>
                            {!user?.user_metadata?.avatar_url && (user?.user_metadata?.full_name?.substring(0, 1).toUpperCase() || user.email?.substring(0, 1).toUpperCase())}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-white truncate uppercase tracking-wider">
                                {user?.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 truncate">{user.email}</p>
                        </div>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-5 py-3.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-bold text-sm group active:scale-95"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Encerrar Sessão</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen bg-slate-50 relative flex flex-col">
                {/* Mobile top spacer */}
                <div className="h-16 lg:hidden" />
                
                <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto w-full flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
