import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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

import News from './pages/admin/News';
import Publications from './pages/admin/Publications';
import Events from './pages/admin/Events';

function App() {
    return (
        <AuthProvider>
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
                    <Route path="/admin/login" element={<Login />} />

                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="membros" element={<Members />} />
                        <Route path="noticias" element={<News />} />
                        <Route path="publicacoes" element={<Publications />} />
                        <Route path="eventos" element={<Events />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
