import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Users, Newspaper, LogOut, LayoutDashboard, Calendar, UserCog, BookOpen, ClipboardList, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
    const { user, loading, signOut } = useAuth();
    const location = useLocation();

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
        return <Navigate to="/admin/login" replace />;
    }

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/admin/membros', icon: Users, label: 'Membros' },
        { path: '/admin/noticias', icon: Newspaper, label: 'Notícias' },
        { path: '/admin/publicacoes', icon: BookOpen, label: 'Publicações' },
        { path: '/admin/eventos', icon: Calendar, label: 'Eventos' },
        { path: '/admin/editais', icon: ClipboardList, label: 'Editais' },
        { path: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
        { path: '/admin/perfil', icon: UserCog, label: 'Meu Perfil' },
    ];

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-30 shadow-2xl">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xl tracking-tighter leading-none">GSIPP</span>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1 text-center">Admin</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm group ${
                                    isActive
                                        ? 'bg-blue-500 text-white translate-x-1'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4">
                    <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-blue-500 border border-white/10">
                            {user.email?.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate uppercase tracking-wider">{user.email?.split('@')[0]}</p>
                            <p className="text-[10px] font-medium text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-bold text-sm group"
                    >
                        <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen relative">
                <div className="p-10 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
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
