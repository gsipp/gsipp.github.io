import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { translateAuthError } from '../../utils/authErrors';
import { Shield, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(translateAuthError(error.message));
            setLoading(false);
        } else {
            navigate('/gestao-gsipp');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-slate-200 selection:text-slate-900">
            <div className="w-full max-w-[400px]">
                <div className="flex flex-col items-center mb-8">
                    <Shield className="w-8 h-8 text-slate-900 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Entrar no painel</h2>
                    <p className="text-sm text-slate-500 mt-1">Gestão do Grupo GSIPP</p>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-md flex items-center gap-2.5 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none sm:text-sm"
                                placeholder="nome@exemplo.com"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">Senha</label>
                                <Link to="/gestao-gsipp/recuperar-senha" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2 sm:text-sm"
                        >
                            {loading ? 'Autenticando...' : 'Entrar'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <a href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        ← Voltar para o site principal
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
