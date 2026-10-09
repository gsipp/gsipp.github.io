import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search, Printer, Trash2, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateDeclarationHTML } from '../../utils/DeclarationTemplate';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function DeclaracoesAdmin() {
    const [declaracoes, setDeclaracoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const toast = useToast();

    const fetchDeclaracoes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('declaracoes')
            .select('*')
            .order('data_emissao', { ascending: false });

        if (error) {
            toast.error('Erro ao buscar declarações.');
        } else {
            setDeclaracoes(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDeclaracoes();
    }, []);

    const executeDelete = async (id: string) => {
        const { error } = await supabase.from('declaracoes').delete().eq('id', id);
        if (error) {
            toast.error('Erro ao apagar registro.');
        } else {
            toast.success('Registro apagado com sucesso.');
            fetchDeclaracoes();
        }
    };

    const handleReimprimir = async (decl: any) => {
        setActionLoading(decl.id);
        
        try {
            // 1. Fetch member data using CPF or Nome
            let query = supabase.from('membros').select('*');
            
            if (decl.membro_cpf && decl.membro_cpf !== 'Não informado') {
                query = query.eq('cpf', decl.membro_cpf);
            } else {
                query = query.eq('nome', decl.membro_nome);
            }

            const { data: memberData, error: memberError } = await query.limit(1).single();

            if (memberError || !memberData) {
                toast.error('Membro não encontrado! O CPF ou Nome pode ter sido alterado/excluído.');
                setActionLoading(null);
                return;
            }

            // 2. Fetch config
            const { data: configData } = await supabase.from('configuracoes').select('*');
            const settings: Record<string, string> = {};
            configData?.forEach((item: any) => { settings[item.id] = item.valor; });

            // 3. Generate HTML with same code
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                toast.error('Permita os popups para gerar a declaração.');
                setActionLoading(null);
                return;
            }

            const htmlContent = generateDeclarationHTML(memberData, settings['template_declaracao'], settings, decl.codigo);
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        } catch (e) {
            toast.error('Erro ao tentar reimprimir.');
        }
        
        setActionLoading(null);
    };

    const filteredList = declaracoes.filter(d => 
        d.membro_nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.membro_cpf.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Declarações Emitidas</h1>
                    <p className="text-sm text-slate-500 mt-1">Histórico e reimpressão de declarações.</p>
                </div>
                <div className="flex w-full sm:w-auto gap-3">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, CPF ou código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all shadow-sm"
                        />
                    </div>
                    <Link
                        to="/gestao-gsipp/membros"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Nova Declaração
                    </Link>
                </div>
            </header>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-slate-500">Data Emissão</th>
                                <th className="px-6 py-3 font-medium text-slate-500">Nome do Membro</th>
                                <th className="px-6 py-3 font-medium text-slate-500">CPF</th>
                                <th className="px-6 py-3 font-medium text-slate-500">Código de Verificação</th>
                                <th className="px-6 py-3 font-medium text-slate-500 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Carregando registros...
                                    </td>
                                </tr>
                            ) : filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Nenhuma declaração encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map(decl => (
                                    <tr key={decl.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            {new Date(decl.data_emissao).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {decl.membro_nome}
                                        </td>
                                        <td className="px-6 py-4">
                                            {decl.membro_cpf}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 text-xs">
                                                {decl.codigo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleReimprimir(decl)}
                                                    disabled={actionLoading === decl.id}
                                                    title="Reimprimir"
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    {actionLoading === decl.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(decl.id)}
                                                    title="Apagar"
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                                </div>
            </div>

            <ConfirmModal 
                isOpen={!!confirmDelete}
                title="Excluir Declaração"
                description="Tem certeza que deseja apagar esta declaração? O código de verificação não será mais válido."
                onConfirm={() => {
                    if (confirmDelete) executeDelete(confirmDelete);
                }}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
}
