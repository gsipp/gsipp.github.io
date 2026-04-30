import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Save, FileText, CheckCircle, Mail, Clock, Search, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { generateDeclarationHTML } from '../../utils/DeclarationTemplate';

// Types
interface Member {
    id: string;
    nome: string;
    cargo: string;
    area_pesquisa: string;
    lattes_url: string;
    lattes_id: string;
    linkedin_url: string;
    foto_url: string;
    ordem: number;
    cpf?: string;
    email?: string;
    carga_horaria?: string;
    data_entrada?: string;
    data_saida?: string;
    matricula?: string;
    curso?: string;
    orientador?: string;
    total_horas?: string;
}

const getLattesPhotoUrl = (member: Member): string | null => {
    if (member.lattes_id) {
        return `https://servicosweb.cnpq.br/wspessoa/servletrecuperafoto?tipo=1&id=${member.lattes_id}`;
    }
    if (!member.lattes_url) return null;
    const match = member.lattes_url.match(/(?:lattes|buscatextual)\.cnpq\.br\/(\w+)/i);
    if (match && match[1]) {
        return `https://servicosweb.cnpq.br/wspessoa/servletrecuperafoto?tipo=1&id=${match[1]}`;
    }
    return null;
};

const Members = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [formData, setFormData] = useState<Partial<Member>>({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();

    // Fetch members
    const fetchMembers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('membros')
            .select('*')
            .order('ordem', { ascending: true });

        if (error) console.error('Error fetching members:', error);
        else setMembers(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const filteredMembers = members.filter(m => 
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.area_pesquisa?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Handle Delete
    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('membros').delete().eq('id', id);
        if (error) {
            toast.error('Erro ao excluir membro: ' + error.message);
        } else {
            setMembers(members.filter(m => m.id !== id));
            toast.success('Membro removido com sucesso.');
        }
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nome || !formData.nome.trim()) {
            toast.error("Por favor, preencha o Nome Completo.");
            return;
        }

        if (!formData.cargo || !formData.cargo.trim()) {
            toast.error("Por favor, selecione o Cargo.");
            return;
        }

        setSaving(true);

        const payload = {
            nome: formData.nome,
            cargo: formData.cargo,
            area_pesquisa: formData.area_pesquisa,
            lattes_url: formData.lattes_url,
            lattes_id: formData.lattes_id,
            linkedin_url: formData.linkedin_url,
            foto_url: formData.foto_url,
            ordem: formData.ordem,
            cpf: formData.cpf,
            email: formData.email,
            carga_horaria: formData.carga_horaria,
            data_entrada: formData.data_entrada,
            data_saida: formData.data_saida,
            matricula: formData.matricula,
            curso: formData.curso,
            orientador: formData.orientador,
            total_horas: formData.total_horas
        };

        if (editingMember) {
            const { error } = await supabase
                .from('membros')
                .update(payload)
                .eq('id', editingMember.id);

            if (error) toast.error('Erro ao atualizar: ' + error.message);
            else toast.success('Membro atualizado com sucesso.');
        } else {
            const { error } = await supabase
                .from('membros')
                .insert([payload]);

            if (error) toast.error('Erro ao criar membro: ' + error.message);
            else toast.success('Membro adicionado com sucesso.');
        }

        setSaving(false);
        setIsModalOpen(false);
        setEditingMember(null);
        setFormData({});
        fetchMembers();
    };

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `members/${fileName}`;

        setUploading(true);
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
            toast.error('Erro no upload da imagem: ' + uploadError.message);
        } else {
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFormData({ ...formData, foto_url: data.publicUrl });
        }
        setUploading(false);
    };

    const openModal = (member?: Member) => {
        if (member) {
            setEditingMember(member);
            setFormData(member);
        } else {
            setEditingMember(null);
            setFormData({});
        }
        setIsModalOpen(true);
    };

    const generateDeclaration = async (member: Member) => {
        const { data: configData } = await supabase
            .from('configuracoes')
            .select('*');

        const settings: Record<string, string> = {};
        configData?.forEach(item => {
            settings[item.id] = item.valor;
        });

        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert('Por favor, permita popups para gerar a declaração.');

        const htmlContent = generateDeclarationHTML(member, settings['template_declaracao'], settings);

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 11) v = v.substring(0, 11);
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        setFormData({ ...formData, cpf: v });
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Corpo de Membros</h1>
                    <p className="text-gray-500">Gestão de pesquisadores, alunos e colaboradores do GSIPP.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar membro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full bg-white"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> <span className="hidden md:inline">Novo Membro</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Membro</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Dados Internos</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm shrink-0">
                                                        {member.foto_url ? (
                                                            <img src={member.foto_url} alt={member.nome} className="w-full h-full object-cover" />
                                                        ) : getLattesPhotoUrl(member) ? (
                                                            <img src={getLattesPhotoUrl(member)!} alt={member.nome} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-black">
                                                                {member.nome.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg shadow-sm flex items-center justify-center border border-gray-100">
                                                        <span className="text-[10px] font-black text-blue-600">#{member.ordem}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-base">{member.nome}</div>
                                                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                                        {member.cargo}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm text-gray-600 space-y-1.5">
                                                {member.email && (
                                                    <div className="flex items-center gap-2 group/info">
                                                        <Mail className="w-4 h-4 text-gray-300 group-hover/info:text-blue-500 transition-colors" />
                                                        <span className="font-medium">{member.email}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <Clock className="w-3.5 h-3.5" /> 
                                                    {member.carga_horaria ? `${member.carga_horaria}h semanais` : 'Carga horária n/d'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => generateDeclaration(member)}
                                                    className="p-2.5 hover:bg-white text-gray-400 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
                                                    title="Gerar Declaração"
                                                >
                                                    <FileText className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openModal(member)}
                                                    className="p-2.5 hover:bg-white text-gray-400 hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(member.id)}
                                                    className="p-2.5 hover:bg-white text-gray-400 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredMembers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-20 text-center">
                                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-medium">Nenhum membro encontrado.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                                <h3 className="font-bold text-lg text-slate-900">
                                    {editingMember ? 'Editar Detalhes' : 'Novo Membro'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Photo Area */}
                                <div className="flex justify-center">
                                    <div className="relative group w-32 h-32">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center relative">
                                            {formData.foto_url ? (
                                                <img src={formData.foto_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="w-10 h-10 text-slate-300" />
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-md transition-all z-30">
                                            <Pencil className="w-4 h-4" />
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                {/* Personal Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                                        <input type="text" required value={formData.nome || ''} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                                        <input type="text" value={formData.cpf || ''} onChange={handleCpfChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="000.000.000-00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="email@exemplo.com" />
                                    </div>
                                </div>

                                {/* Academic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cargo *</label>
                                        <select className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.cargo || ''} onChange={e => setFormData({ ...formData, cargo: e.target.value })}>
                                            <option value="">Selecione...</option>
                                            <option value="Docente">Docente</option>
                                            <option value="Mestrando">Mestrando</option>
                                            <option value="Graduação">Graduação</option>
                                            <option value="Egresso">Egresso</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Área de Pesquisa</label>
                                        <input type="text" value={formData.area_pesquisa || ''} onChange={e => setFormData({ ...formData, area_pesquisa: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                </div>

                                {/* GSIPP Data */}
                                <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                                    <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-600" /> Dados para Declaração
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Matrícula</label>
                                            <input type="text" value={formData.matricula || ''} onChange={e => setFormData({ ...formData, matricula: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Ex: 509506" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Curso</label>
                                            <select 
                                                value={formData.curso || ''} 
                                                onChange={e => setFormData({ ...formData, curso: e.target.value })} 
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            >
                                                <option value="">Selecione um curso...</option>
                                                <option value="Ciência da Computação">Ciência da Computação</option>
                                                <option value="Sistemas de Informação">Sistemas de Informação</option>
                                                <option value="Engenharia de Software">Engenharia de Software</option>
                                                <option value="Outro">Outro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Orientador</label>
                                            <input type="text" value={formData.orientador || ''} onChange={e => setFormData({ ...formData, orientador: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Ex: professor Antonio Emerson..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Total de Horas</label>
                                            <input type="text" value={formData.total_horas || ''} onChange={e => setFormData({ ...formData, total_horas: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Ex: 160" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-4 mt-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Carga Horária Semanal</label>
                                            <input type="text" value={formData.carga_horaria || ''} onChange={e => setFormData({ ...formData, carga_horaria: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Ex: 04h" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Prioridade (Ordem)</label>
                                            <input type="number" value={formData.ordem || 0} onChange={e => setFormData({ ...formData, ordem: parseInt(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Data Entrada</label>
                                            <input type="date" value={formData.data_entrada || ''} onChange={e => setFormData({ ...formData, data_entrada: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Data Saída (Opcional)</label>
                                            <input type="date" value={formData.data_saida || ''} onChange={e => setFormData({ ...formData, data_saida: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Link Lattes</label>
                                        <input type="url" value={formData.lattes_url || ''} onChange={e => setFormData({ ...formData, lattes_url: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ID Lattes</label>
                                        <input type="text" value={formData.lattes_id || ''} onChange={e => setFormData({ ...formData, lattes_id: e.target.value })} placeholder="K1105632T3" className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
                                        <p className="text-xs text-slate-500 mt-1">Código do pesquisador no Lattes (ex: K1105632T3)</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
                                        <input type="url" value={formData.linkedin_url || ''} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors">Cancelar</button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editingMember ? 'Salvar Alterações' : 'Adicionar Membro'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Remover membro"
                description="Tem certeza que deseja remover este membro? Esta ação não pode ser desfeita."
                onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default Members;
