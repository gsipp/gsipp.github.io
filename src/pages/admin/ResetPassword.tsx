import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { translateAuthError } from '../../utils/authErrors';
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // The user should have an active session if they arrived here from the recovery link
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Link de recuperação inválido ou expirado. Por favor, solicite um novo link.');
            }
        };
        checkSession();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError('');

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(translateAuthError(error.message));
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate('/gestao-gsipp');
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-slate-200 selection:text-slate-900">
            <div className="w-full max-w-[400px]">
                <div className="flex flex-col items-center mb-8">
                    <Lock className="w-8 h-8 text-slate-900 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Criar Nova Senha</h2>
                    <p className="text-sm text-slate-500 mt-1 text-center">Digite sua nova senha de acesso abaixo</p>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-md flex items-center gap-2.5 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-md flex items-start gap-2.5 text-emerald-700 text-sm">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-0.5">Senha atualizada!</p>
                                <p>Redirecionando você para o painel...</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nova Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none sm:text-sm pr-10"
                                    placeholder="••••••••"
                                    disabled={success || error === 'Link de recuperação inválido ou expirado. Por favor, solicite um novo link.'}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar Nova Senha</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all outline-none sm:text-sm pr-10"
                                    placeholder="••••••••"
                                    disabled={success || error === 'Link de recuperação inválido ou expirado. Por favor, solicite um novo link.'}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success || error === 'Link de recuperação inválido ou expirado. Por favor, solicite um novo link.'}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-md transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2 sm:text-sm"
                        >
                            {loading ? 'Salvando...' : 'Atualizar Senha'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
