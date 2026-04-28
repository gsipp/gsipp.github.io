import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, Loader2, FileText, Info, RefreshCw, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
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

    useEffect(() => {
        fetchConfig();
    }, []);

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

    const handleSave = async () => {
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
        } catch (error: any) {
            toast.error('Erro ao salvar: ' + error.message);
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
        } catch (err: any) {
            toast.error('Erro no upload: ' + err.message);
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
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
                    <p className="text-slate-500 font-medium">Ajuste a identidade visual e os templates de documentos.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Salvar Alterações
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Visual Identity Section */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-blue-600" /> Identidade Visual e Cabeçalho
                            </h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Logo Universidade (Esquerda)</label>
                                    <div className="relative group aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-blue-400">
                                        {logoUfc ? (
                                            <img src={logoUfc} alt="UFC Logo" className="max-h-[80%] object-contain" />
                                        ) : (
                                            <Loader2 className="w-8 h-8 text-slate-300" />
                                        )}
                                        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <span className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
                                                {uploading.ufc ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                Trocar Logo
                                            </span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'ufc')} />
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Logo Grupo (Direita)</label>
                                    <div className="relative group aspect-video bg-slate-900 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-blue-400">
                                        {logoGsipp ? (
                                            <img src={logoGsipp} alt="GSIPP Logo" className="max-h-[80%] object-contain" />
                                        ) : (
                                            <Loader2 className="w-8 h-8 text-slate-300" />
                                        )}
                                        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <span className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
                                                {uploading.gsipp ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                Trocar Logo
                                            </span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'gsipp')} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Dados de Endereço (Centro)</label>
                                <textarea 
                                    value={headerAddress}
                                    onChange={e => setHeaderAddress(e.target.value)}
                                    rows={4}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-slate-700 font-mono text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Endereço, CNPJ, etc..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Template Section */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900">Texto Base da Declaração</h3>
                            </div>
                            <button 
                                onClick={resetToDefault}
                                className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" /> Restaurar Padrão
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-bold mb-1">Dica de Placeholders:</p>
                                    <p>Use as tags abaixo para que o sistema substitua automaticamente pelos dados do membro:</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {['nome', 'matricula', 'cpf', 'curso', 'data_inicio', 'data_fim', 'carga_horaria', 'orientador', 'total_horas'].map(tag => (
                                            <code key={tag} className="bg-white/50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px] font-mono">
                                                {`{{${tag}}}`}
                                            </code>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Texto da Declaração</label>
                                <textarea 
                                    value={template}
                                    onChange={e => setTemplate(e.target.value)}
                                    rows={10}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none leading-relaxed"
                                    placeholder="Escreva o texto da declaração aqui..."
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Eye className="w-32 h-32" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 relative z-10">Prévia Rápida</h3>
                        <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed">
                            Assim é como o texto aparecerá no documento final (exemplo com dados fictícios).
                        </p>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-xs leading-relaxed text-slate-300 italic relative z-10">
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
