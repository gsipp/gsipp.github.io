import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { translateAuthError } from '../../utils/authErrors';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/gestao-gsipp/redefinir-senha`,
        });

        if (error) {
            setError(translateAuthError(error.message));
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-slate-200 selection:text-slate-900">
            <div className="w-full max-w-[400px]">
                <div className="flex flex-col items-center mb-8">
                    <KeyRound className="w-8 h-8 text-slate-900 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Recuperar Senha</h2>
                    <p className="text-sm text-slate-500 mt-1 text-center">Enviaremos um link de recuperação para você</p>
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
                                <p className="font-semibold mb-0.5">E-mail enviado!</p>
                                <p>Verifique sua caixa de entrada e pasta de spam.</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleReset} className="space-y-4">
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

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-md transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2 sm:text-sm"
                        >
                            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <Link to="/gestao-gsipp/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        ← Voltar para o Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
