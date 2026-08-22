import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, Loader2, FileText, RefreshCw, Eye, Image as ImageIcon, Building } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const Config = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<{ ufc?: boolean; gsipp?: boolean }>({});
    
    // Settings state
    const [template, setTemplate] = useState('');
    const [logoUfc, setLogoUfc] = useState('');
    const [logoGsipp, setLogoGsipp] = useState('');
    const [headerAddress, setHeaderAddress] = useState('');
    
    const toast = useToast();

    const defaultTemplate = `Declaramos, para os devidos fins, que {{nome}}, matrícula {{matricula}}, CPF {{cpf}}, estudante do curso de {{curso}}, participou como voluntário do Grupo de Pesquisa em Segurança da Informação e Preservação da Privacidade (GSIPP) da Universidade Federal do Ceará - Campus de Crateús, no período de {{data_inicio}} a {{data_fim}}, com carga horária semanal de {{carga_horaria}} horas, sob a orientação do {{orientador}}, totalizando {{total_horas}} horas ao longo do período.`;
    const defaultAddress = `07.272.636/0001-31\nCampus Universitário\nAvenida Professora Machadinha Lima, S/N -\nPríncipe Imperial, Crateús - CE, 63708-825`;

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('configuracoes')
                .select('*');

            if (error) {
                console.error('Error fetching config:', error);
                toast.error('Erro ao carregar configurações.');
            } else {
                const getVal = (id: string) => data?.find(i => i.id === id)?.valor;
                
                setTemplate(getVal('template_declaracao') || defaultTemplate);
                setLogoUfc(getVal('logo_ufc') || 'https://www.crateus.ufc.br/wp-content/uploads/2021/04/logo-ufc-crateus-300x125.png');
                setLogoGsipp(getVal('logo_gsipp') || 'https://gsipp.github.io/logo-dark.png');
                setHeaderAddress(getVal('cabecalho_endereco') || defaultAddress);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line
    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const updates = [
                { id: 'template_declaracao', valor: template },
                { id: 'logo_ufc', valor: logoUfc },
                { id: 'logo_gsipp', valor: logoGsipp },
                { id: 'cabecalho_endereco', valor: headerAddress }
            ];

            const { error } = await supabase
                .from('configuracoes')
                .upsert(updates);

            if (error) throw error;
            toast.success('Configurações salvas com sucesso!');
        } catch (error: unknown) {
            toast.error('Erro ao salvar: ' + (error as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'ufc' | 'gsipp') => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `logo_${type}_${Math.random()}.${fileExt}`;
        const filePath = `config/${fileName}`;

        setUploading({ ...uploading, [type]: true });
        try {
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            if (type === 'ufc') setLogoUfc(data.publicUrl);
            else setLogoGsipp(data.publicUrl);
            
            toast.success('Logo enviada com sucesso!');
        } catch (err: unknown) {
            toast.error('Erro no upload: ' + (err as Error).message);
        } finally {
            setUploading({ ...uploading, [type]: false });
        }
    };

    const resetToDefault = () => {
        if (window.confirm('Tem certeza que deseja restaurar o texto padrão?')) {
            setTemplate(defaultTemplate);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
                    <p className="text-sm text-slate-500 mt-1">Ajuste a identidade visual e os templates de documentos.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Visual Identity Section */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-slate-500" /> Identidade Visual e Cabeçalho
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Logo Universidade (Esquerda)</label>
                                    <div className="relative group aspect-video bg-slate-50 rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden hover:border-slate-400 transition-colors">
                                        {logoUfc ? (
                                            <img src={logoUfc} alt="UFC Logo" className="max-h-[80%] object-contain" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-slate-300" />
                                        )}
                                        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <span className="bg-white text-slate-900 px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-2">
                                                {uploading.ufc ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                Trocar Logo
                                            </span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'ufc')} />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Logo Grupo (Direita)</label>
                                    <div className="relative group aspect-video bg-slate-900 rounded-md border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden hover:border-slate-500 transition-colors">
                                        {logoGsipp ? (
                                            <img src={logoGsipp} alt="GSIPP Logo" className="max-h-[80%] object-contain" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-slate-600" />
                                        )}
                                        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <span className="bg-white text-slate-900 px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-2">
                                                {uploading.gsipp ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                Trocar Logo
                                            </span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'gsipp')} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-slate-400" /> Dados de Endereço (Centro)
                                </label>
                                <textarea 
                                    value={headerAddress}
                                    onChange={e => setHeaderAddress(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all resize-y"
                                    placeholder="Endereço, CNPJ, etc..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Template Section */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500" /> Texto Base da Declaração
                            </h3>
                            <button 
                                onClick={resetToDefault}
                                className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" /> Restaurar Padrão
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-md">
                                <h4 className="text-sm font-medium text-slate-900 mb-2">Dica de Placeholders:</h4>
                                <p className="text-xs text-slate-500 mb-3">Use as tags abaixo para que o sistema substitua automaticamente pelos dados do membro:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['nome', 'matricula', 'cpf', 'curso', 'data_inicio', 'data_fim', 'carga_horaria', 'orientador', 'total_horas'].map(tag => (
                                        <code key={tag} className="bg-white px-2 py-1 rounded border border-slate-200 text-xs font-mono text-slate-700">
                                            {`{{${tag}}}`}
                                        </code>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Texto da Declaração</label>
                                <textarea 
                                    value={template}
                                    onChange={e => setTemplate(e.target.value)}
                                    rows={10}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all resize-y leading-relaxed"
                                    placeholder="Escreva o texto da declaração aqui..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Eye className="w-4 h-4 text-slate-400" />
                            <h3 className="text-sm font-semibold text-slate-900">Prévia Rápida</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                            Assim é como o texto aparecerá no documento final (exemplo com dados fictícios).
                        </p>
                        <div className="bg-slate-50 rounded-md p-4 border border-slate-200 text-xs leading-relaxed text-slate-600 italic">
                            {template
                                .replace('{{nome}}', 'João da Silva')
                                .replace('{{matricula}}', '509506')
                                .replace('{{cpf}}', '000.000.000-00')
                                .replace('{{curso}}', 'Ciência da Computação')
                                .replace('{{data_inicio}}', '01/01/2024')
                                .replace('{{data_fim}}', '31/12/2024')
                                .replace('{{carga_horaria}}', '12')
                                .replace('{{orientador}}', 'Prof. Dr. Antonio Emerson')
                                .replace('{{total_horas}}', '160')
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Config;
