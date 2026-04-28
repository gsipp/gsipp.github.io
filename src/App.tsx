import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';
import Membros from './pages/Membros';
import Noticias from './pages/Noticias';
import Publicacoes from './pages/Publicacoes';
import Eventos from './pages/Eventos';
import Editais from './pages/Editais';
import NoticiaDetalhe from './pages/NoticiaDetalhe';
import EditaisAdmin from './pages/admin/Editais';

import News from './pages/admin/News';
import Publications from './pages/admin/Publications';
import Events from './pages/admin/Events';
import Profile from './pages/admin/Profile';
import Config from './pages/admin/Config';

function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <ToastProvider>
                    <Router>
                        <Routes>
                            {/* Public Routes */}
                            <Route element={<Layout><Home /></Layout>} path="/" />
                            <Route element={<Layout><Membros /></Layout>} path="/membros" />
                            <Route element={<Layout><Noticias /></Layout>} path="/noticias" />
                            <Route element={<Layout><Publicacoes /></Layout>} path="/publicacoes" />
                            <Route element={<Layout><Eventos /></Layout>} path="/eventos" />
                            <Route element={<Layout><Editais /></Layout>} path="/editais" />
                            <Route element={<Layout><NoticiaDetalhe /></Layout>} path="/noticias/:slug" />

                            {/* Admin Routes */}
                            <Route path="/gestao-gsipp/login" element={<Login />} />

                            <Route path="/gestao-gsipp" element={<AdminLayout />}>
                                <Route index element={<Dashboard />} />
                                <Route path="membros" element={<Members />} />
                                <Route path="noticias" element={<News />} />
                                <Route path="publicacoes" element={<Publications />} />
                                <Route path="eventos" element={<Events />} />
                                <Route path="editais" element={<EditaisAdmin />} />
                                <Route path="perfil" element={<Profile />} />
                                <Route path="configuracoes" element={<Config />} />
                                {/* Redirect unknown admin paths to dashboard */}
                                <Route path="*" element={<Navigate to="/gestao-gsipp" replace />} />
                            </Route>

                            {/* 404 Catch-all */}
                            <Route path="*" element={
                                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-8">
                                    <p className="text-8xl font-black text-gray-200 mb-4">404</p>
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Página não encontrada</h1>
                                    <p className="text-gray-500 mb-6">A URL que você acessou não existe.</p>
                                    <a href="/" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                                        Voltar para o início
                                    </a>
                                </div>
                            } />
                        </Routes>
                    </Router>
                </ToastProvider>
            </AuthProvider>
        </HelmetProvider>
    );
}

export default App;
