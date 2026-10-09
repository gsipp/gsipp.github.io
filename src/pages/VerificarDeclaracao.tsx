import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function VerificarDeclaracao() {
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<any>(null);
    const [erro, setErro] = useState(false);

    const formatCode = (val: string) => {
        const cleaned = val.replace(/[^A-Z0-9]/ig, '').toUpperCase();
        const match = cleaned.match(/.{1,4}/g);
        return match ? match.join('-') : cleaned;
    };

    const handleVerificar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!codigo || codigo.length < 8) return;

        setLoading(true);
        setResultado(null);
        setErro(false);

        try {
            const { data, error } = await supabase
                .from('declaracoes')
                .select('*')
                .eq('codigo', codigo)
                .single();

            if (error || !data) {
                setErro(true);
            } else {
                setResultado(data);
            }
        } catch (err) {
            setErro(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center px-4 pt-28 pb-12 w-full">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Verificar Declaração</h1>
                    <p className="text-slate-500 text-sm">
                        Digite o código de 8 caracteres presente no rodapé da declaração para verificar sua autenticidade.
                    </p>
                </div>

                <form onSubmit={handleVerificar} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Ex: A8F9-B3C2"
                            value={codigo}
                            onChange={(e) => setCodigo(formatCode(e.target.value))}
                            maxLength={9}
                            className="w-full text-center text-2xl tracking-[0.25em] font-mono px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 uppercase transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || codigo.length < 9}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Verificar Autenticidade
                    </button>
                </form>

                {resultado && (
                    <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <h3 className="font-bold text-green-900">Declaração Válida!</h3>
                        </div>
                        <div className="space-y-2 text-sm text-green-800">
                            <p><strong>Emitida para:</strong> {resultado.membro_nome}</p>
                            <p><strong>Documento (CPF):</strong> {resultado.membro_cpf}</p>
                            <p><strong>Data de Emissão:</strong> {new Date(resultado.data_emissao).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Código:</strong> {resultado.codigo}</p>
                        </div>
                    </div>
                )}

                {erro && (
                    <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle className="w-6 h-6 text-red-600" />
                            <h3 className="font-bold text-red-900">Declaração não encontrada</h3>
                        </div>
                        <p className="text-sm text-red-800">
                            Verifique se o código foi digitado corretamente. Caso o erro persista, esta declaração pode não ser autêntica ou foi revogada.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
