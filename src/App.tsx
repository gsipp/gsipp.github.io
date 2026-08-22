import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Membros from './pages/Membros';
import Noticias from './pages/Noticias';
import Publicacoes from './pages/Publicacoes';
import Eventos from './pages/Eventos';
import Editais from './pages/Editais';
import NoticiaDetalhe from './pages/NoticiaDetalhe';
import NotFound from './pages/NotFound';
import { Loader2 } from 'lucide-react';

// Lazy loading admin pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Members = lazy(() => import('./pages/admin/Members'));
const News = lazy(() => import('./pages/admin/News'));
const Publications = lazy(() => import('./pages/admin/Publications'));
const ImportPublications = lazy(() => import('./pages/admin/ImportPublications'));
const EventsAdmin = lazy(() => import('./pages/admin/Events'));
const EditaisAdmin = lazy(() => import('./pages/admin/Editais'));
const Profile = lazy(() => import('./pages/admin/Profile'));
const Config = lazy(() => import('./pages/admin/Config'));

// Fallback loader for suspense
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <HelmetProvider>
                <AuthProvider>
                    <ToastProvider>
                        <Router>
                            <Suspense fallback={<PageLoader />}>
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
                                    <Route path="/gestao-gsipp/recuperar-senha" element={<ForgotPassword />} />
                                    <Route path="/gestao-gsipp/redefinir-senha" element={<ResetPassword />} />

                                    <Route path="/gestao-gsipp" element={<AdminLayout />}>
                                        <Route index element={<Dashboard />} />
                                        <Route path="membros" element={<Members />} />
                                        <Route path="noticias" element={<News />} />
                                        <Route path="publicacoes" element={<Publications />} />
                                        <Route path="publicacoes/importar" element={<ImportPublications />} />
                                        <Route path="eventos" element={<EventsAdmin />} />
                                        <Route path="editais" element={<EditaisAdmin />} />
                                        <Route path="perfil" element={<Profile />} />
                                        <Route path="configuracoes" element={<Config />} />
                                        {/* Redirect unknown admin paths to dashboard */}
                                        <Route path="*" element={<Navigate to="/gestao-gsipp" replace />} />
                                    </Route>

                                    {/* 404 Catch-all */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </Suspense>
                        </Router>
                    </ToastProvider>
                </AuthProvider>
            </HelmetProvider>
        </ErrorBoundary>
    );
}

export default App;

