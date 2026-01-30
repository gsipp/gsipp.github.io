import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Save, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Member {
    id: string;
    nome: string;
    cargo: string;
    area_pesquisa: string;
    lattes_url: string;
    linkedin_url: string;
    foto_url: string;
    ordem: number;
    // New fields
    cpf?: string;
    email?: string;
    carga_horaria?: string;
    data_entrada?: string;
    data_saida?: string;
}

const Members = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [formData, setFormData] = useState<Partial<Member>>({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

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

    // Handle Delete
    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja remover este membro?')) return;

        const { error } = await supabase.from('membros').delete().eq('id', id);

        if (error) {
            alert('Erro ao deletar: ' + error.message);
        } else {
            setMembers(members.filter(m => m.id !== id));
        }
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            nome: formData.nome,
            cargo: formData.cargo,
            area_pesquisa: formData.area_pesquisa,
            lattes_url: formData.lattes_url,
            linkedin_url: formData.linkedin_url,
            foto_url: formData.foto_url,
            ordem: formData.ordem,
            cpf: formData.cpf,
            email: formData.email,
            carga_horaria: formData.carga_horaria,
            data_entrada: formData.data_entrada,
            data_saida: formData.data_saida
        };

        if (editingMember) {
            const { error } = await supabase
                .from('membros')
                .update(payload)
                .eq('id', editingMember.id);

            if (error) alert('Erro ao atualizar: ' + error.message);
        } else {
            const { error } = await supabase
                .from('membros')
                .insert([payload]);

            if (error) alert('Erro ao criar: ' + error.message);
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
            alert('Erro no upload da imagem: ' + uploadError.message);
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

    const generateDeclaration = (member: Member) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert('Por favor, permita popups para gerar a declaração.');

        const startDate = member.data_entrada ? new Date(member.data_entrada).toLocaleDateString('pt-BR') : 'DD/MM/AAAA';
        const endDate = member.data_saida ? new Date(member.data_saida).toLocaleDateString('pt-BR') : 'o presente momento';
        const currentDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Declaração - ${member.nome}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                    .header { text-align: center; margin-bottom: 60px; }
                    .header img { height: 80px; margin-bottom: 20px; }
                    .title { font-size: 24pt; font-weight: bold; text-align: center; margin-bottom: 40px; text-transform: uppercase; }
                    .content { font-size: 14pt; text-align: justify; margin-bottom: 60px; }
                    .signature { text-align: center; margin-top: 100px; }
                    .signature-line { border-top: 1px solid black; width: 60%; margin: 0 auto 10px auto; }
                    .footer { text-align: center; font-size: 10pt; margin-top: 50px; color: #555; }
                </style>
            </head>
            <body>
                <div class="header">
                    <!-- Placeholder for Logo -->
                    <h3>UNIVERSIDADE FEDERAL DO CEARÁ</h3>
                    <h3>GRUPO DE SEGURANÇA DA INFORMAÇÃO E PRIVACIDADE - GSIPP</h3>
                </div>

                <div class="title">DECLARAÇÃO</div>

                <div class="content">
                    <p>
                        Declaramos para os devidos fins que <strong>${member.nome.toUpperCase()}</strong>, 
                        inscrito(a) no CPF sob o nº ${member.cpf || '___________'}, 
                        atuou como pesquisador(a) voluntário(a) no Grupo de Segurança da Informação e Privacidade (GSIPP) da Universidade Federal do Ceará.
                    </p>
                    <p>
                        O(A) referido(a) pesquisador(a) desempenhou atividades de pesquisa na área de <strong>${member.area_pesquisa || 'Segurança da Informação'}</strong>, 
                        cumprindo uma carga horária semanal de <strong>${member.carga_horaria || '__'} horas</strong>, 
                        no período de <strong>${startDate}</strong> até <strong>${endDate}</strong>.
                    </p>
                </div>

                <div class="signature">
                    <div class="signature-line"></div>
                    <p><strong>Coordenação do GSIPP</strong><br>Universidade Federal do Ceará</p>
                </div>

                <div class="footer">
                    <p>Fortaleza, ${currentDate}</p>
                </div>
                <script>
                    window.print();
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Membros</h1>
                    <p className="text-gray-500">Gerencie a equipe e emita declarações.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30 whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" /> Novo Membro
                </button>
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
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm shrink-0">
                                                    {member.foto_url ? (
                                                        <img src={member.foto_url} alt={member.nome} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 font-bold text-xs">
                                                            {member.nome.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{member.nome}</div>
                                                    <div className="text-xs text-gray-500">{member.cargo} • {member.area_pesquisa}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 space-y-1">
                                                {member.email && <div className="flex items-center gap-1">📧 {member.email}</div>}
                                                {member.cpf && <div className="flex items-center gap-1">🪪 {member.cpf}</div>}
                                                {(member.carga_horaria) && <div className="flex items-center gap-1">⏱ {member.carga_horaria} semanais</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => generateDeclaration(member)}
                                                    className="p-2 hover:bg-white text-gray-400 hover:text-green-600 rounded-lg transition-colors border border-transparent hover:border-gray-100 hover:shadow-sm"
                                                    title="Gerar Declaração"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openModal(member)}
                                                    className="p-2 hover:bg-white text-gray-400 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-gray-100 hover:shadow-sm"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-2 hover:bg-white text-gray-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-gray-100 hover:shadow-sm"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {members.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-16 text-center text-gray-400">
                                            Nenhum membro cadastrado.
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
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                                <h3 className="font-bold text-lg text-gray-900">
                                    {editingMember ? 'Editar Detalhes' : 'Novo Membro'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Photo Area */}
                                <div className="flex justify-center">
                                    <div className="relative group w-32 h-32">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50 flex items-center justify-center relative">
                                            {formData.foto_url ? (
                                                <img src={formData.foto_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="w-10 h-10 text-gray-300" />
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                                        <input type="text" required value={formData.nome || ''} onChange={e => setFormData({ ...formData, nome: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                                        <input type="text" value={formData.cpf || ''} onChange={e => setFormData({ ...formData, cpf: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="000.000.000-00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="email@exemplo.com" />
                                    </div>
                                </div>

                                {/* Academic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
                                        <select className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={formData.cargo || ''} onChange={e => setFormData({ ...formData, cargo: e.target.value })}>
                                            <option value="">Selecione...</option>
                                            <option value="Docente">Docente</option>
                                            <option value="Mestrando">Mestrando</option>
                                            <option value="Graduação">Graduação</option>
                                            <option value="Egresso">Egresso</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Área de Pesquisa</label>
                                        <input type="text" value={formData.area_pesquisa || ''} onChange={e => setFormData({ ...formData, area_pesquisa: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                </div>

                                {/* GSIPP Data */}
                                <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" /> Dados para Declaração
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Carga Horária Semanal</label>
                                            <input type="text" value={formData.carga_horaria || ''} onChange={e => setFormData({ ...formData, carga_horaria: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Ex: 20h" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Prioridade (Ordem)</label>
                                            <input type="number" value={formData.ordem || 0} onChange={e => setFormData({ ...formData, ordem: parseInt(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Data Entrada</label>
                                            <input type="date" value={formData.data_entrada || ''} onChange={e => setFormData({ ...formData, data_entrada: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Data Saída (Opcional)</label>
                                            <input type="date" value={formData.data_saida || ''} onChange={e => setFormData({ ...formData, data_saida: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Lattes</label>
                                        <input type="url" value={formData.lattes_url || ''} onChange={e => setFormData({ ...formData, lattes_url: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                                        <input type="url" value={formData.linkedin_url || ''} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-70">
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Members;
