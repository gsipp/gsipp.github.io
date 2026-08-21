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
                <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
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
    ];

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-6 z-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-slate-900" />
                    <span className="font-bold text-lg tracking-tight">GSIPP</span>
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                    aria-label="Toggle Menu"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Minimalist Design */}
            <aside className={`
                w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <Shield className="w-6 h-6 text-slate-900" />
                        <span className="font-bold text-lg tracking-tight">GSIPP</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium text-sm ${
                                    isActive
                                        ? 'bg-slate-100 text-slate-900'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-4 border-t border-slate-100">
                    <NavLink 
                        to="/gestao-gsipp/perfil"
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors mb-2 ${
                                isActive 
                                    ? 'bg-slate-100' 
                                    : 'hover:bg-slate-50'
                            }`
                        }
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 overflow-hidden bg-center bg-cover"
                             style={user?.user_metadata?.avatar_url ? { backgroundImage: `url(${user.user_metadata.avatar_url})` } : {}}>
                            {!user?.user_metadata?.avatar_url && (user?.user_metadata?.full_name?.substring(0, 1).toUpperCase() || user.email?.substring(0, 1).toUpperCase())}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                                {user?.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-h-screen bg-slate-50 relative flex flex-col">
                {/* Mobile top spacer */}
                <div className="h-16 lg:hidden" />
                
                <div className="p-6 md:p-8 max-w-5xl mx-auto w-full flex-grow">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
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
