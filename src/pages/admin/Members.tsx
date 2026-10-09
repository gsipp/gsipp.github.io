import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Save, FileText, Clock, Users } from 'lucide-react';
import AdminSearch from '../../components/admin/AdminSearch';
import AdminTable from '../../components/admin/AdminTable';
import Pagination from '../../components/admin/Pagination';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { generateDeclarationHTML } from '../../utils/DeclarationTemplate';

import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import Dropdown from '../../components/Dropdown';
import { zodResolver } from '@hookform/resolvers/zod';

// Types
interface Member {
    id: string;
    nome: string;
    cargo: string;
    area_pesquisa: string | null;
    lattes_url: string | null;
    lattes_id: string | null;
    linkedin_url: string | null;
    foto_url: string | null;
    ordem: number;
    cpf?: string | null;
    email?: string | null;
    carga_horaria?: string | null;
    data_entrada?: string | null;
    data_saida?: string | null;
    data_declaracao?: string | null;
    matricula?: string | null;
    curso?: string | null;
    orientador?: string | null;
    total_horas?: string | null;
    researchgate_url?: string | null;
    foto_posicao?: string | null;
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
}

const memberSchema = z.object({
    nome: z.string().min(3, "Nome completo é obrigatório"),
    cargo: z.string().min(1, "Cargo é obrigatório"),
    area_pesquisa: z.string().optional().nullable(),
    lattes_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
    lattes_id: z.string().optional().nullable(),
    linkedin_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
    researchgate_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
    ordem: z.coerce.number().default(0),
    cpf: z.string().optional().nullable(),
    email: z.string().email("E-mail inválido").optional().or(z.literal('')).nullable(),
    carga_horaria: z.string().optional().nullable(),
    data_entrada: z.string().optional().nullable(),
    data_saida: z.string().optional().nullable(),
    data_declaracao: z.string().optional().nullable(),
    matricula: z.string().optional().nullable(),
    curso: z.string().optional().nullable(),
    orientador: z.string().optional().nullable(),
    total_horas: z.string().optional().nullable(),
    foto_posicao: z.string().optional().nullable()
});



const Members = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [uploading, setUploading] = useState(false);
    const [fotoUrl, setFotoUrl] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);
    const toast = useToast();

    const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(memberSchema),
        defaultValues: { ordem: 0, foto_posicao: 'center center' }
    });

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMembers();
    }, []);

    const filteredMembers = members.filter(m => 
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.cargo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
    const paginatedMembers = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('membros').delete().eq('id', id);
        if (error) {
            toast.error('Erro ao excluir membro: ' + (error as Error).message);
        } else {
            setMembers(members.filter(m => m.id !== id));
            toast.success('Membro removido com sucesso.');
        }
    };

    const onSubmit = async (data: Record<string, unknown>) => {
        const { data_declaracao: _ignored, ...dbData } = data; // Omit from DB payload
        const payload = {
            ...dbData,
            foto_url: fotoUrl,
            // Convert empty strings to null for optional fields to avoid db constraint issues if any
            email: data.email || null,
            lattes_url: data.lattes_url || null,
            linkedin_url: data.linkedin_url || null,
            researchgate_url: data.researchgate_url || null,
            data_entrada: data.data_entrada || null,
            data_saida: data.data_saida || null,
        };

        if (editingMember) {
            const { error } = await supabase.from('membros').update(payload).eq('id', editingMember.id);
            if (error) toast.error('Erro ao atualizar: ' + (error as Error).message);
            else {
                toast.success('Membro atualizado com sucesso.');
                fetchMembers();
                closeModal();
            }
        } else {
            const { error } = await supabase.from('membros').insert([payload]);
            if (error) toast.error('Erro ao criar membro: ' + (error as Error).message);
            else {
                toast.success('Membro adicionado com sucesso.');
                fetchMembers();
                closeModal();
            }
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `members/${fileName}`;

        setUploading(true);
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

        if (uploadError) {
            toast.error('Erro no upload da imagem: ' + uploadError.message);
        } else {
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFotoUrl(data.publicUrl);
        }
        setUploading(false);
    };

    const openModal = (member?: Member) => {
        if (member) {
            setEditingMember(member);
            setFotoUrl(member.foto_url);
            reset({
                nome: member.nome,
                cargo: member.cargo,
                area_pesquisa: member.area_pesquisa,
                lattes_url: member.lattes_url,
                lattes_id: member.lattes_id,
                linkedin_url: member.linkedin_url,
                researchgate_url: member.researchgate_url,
                ordem: member.ordem,
                cpf: member.cpf,
                email: member.email,
                carga_horaria: member.carga_horaria,
                data_entrada: member.data_entrada,
                data_saida: member.data_saida,
                data_declaracao: member.data_declaracao,
                matricula: member.matricula,
                curso: member.curso,
                orientador: member.orientador,
                total_horas: member.total_horas,
                foto_posicao: member.foto_posicao || 'center center'
            });
        } else {
            setEditingMember(null);
            setFotoUrl(null);
            reset({
                nome: '', cargo: '', area_pesquisa: '', ordem: 0, foto_posicao: 'center center'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMember(null);
        setFotoUrl(null);
        reset();
    };

    const generateDeclaration = async (member: Member) => {
        // eslint-disable-next-line react-hooks/purity
        const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        try {
            const { error } = await supabase.from('declaracoes').insert({
                codigo: code,
                membro_nome: member.nome,
                membro_cpf: member.cpf || 'Não informado',
                data_emissao: new Date().toISOString()
            });
            if (error) {
                toast.error('Erro ao registrar declaração. Você rodou o SQL?');
                console.error(error);
                return;
            }
        } catch (e) {
            console.error(e);
        }
        const { data: configData } = await supabase.from('configuracoes').select('*');
        const settings: Record<string, string> = {};
        configData?.forEach(item => { settings[item.id] = item.valor; });

        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert('Por favor, permita popups para gerar a declaração.');

        const htmlContent = generateDeclarationHTML(member, settings['template_declaracao'], settings, code);
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Membros</h1>
                    <p className="text-sm text-slate-500 mt-1">Gestão de pesquisadores e colaboradores.</p>
                </div>
                <div className="flex w-full sm:w-auto gap-3">
                    <AdminSearch
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Buscar membro..."
                        />
                    <button
                        onClick={() => openModal()}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Novo Membro
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum membro encontrado</h3>
                    <p className="text-slate-500">Adicione novos membros ou altere sua busca.</p>
                </div>
            ) : (
                <AdminTable 
                    headers={['Membro', 'Vínculo/Cargo', 'Entrada', 'Ações']}
                    pagination={
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredMembers.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    }
                >
                                {paginatedMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                    {member.foto_url || getLattesPhotoUrl(member) ? (
                                                        <img 
                                                            src={(member.foto_url || getLattesPhotoUrl(member))!} 
                                                            alt={member.nome} 
                                                            className="w-full h-full object-cover" 
                                                            style={{ objectPosition: member.foto_posicao || 'center center' }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium text-xs">
                                                            {member.nome.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{member.nome}</div>
                                                    <div className="text-xs text-slate-500">Ord: {member.ordem}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                                {member.cargo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" /> 
                                                {member.carga_horaria ? `${member.carga_horaria}h/sem` : '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => generateDeclaration(member)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all cursor-pointer" title="Gerar Declaração">
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openModal(member)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all cursor-pointer" title="Editar">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setConfirmDelete(member.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer" title="Excluir">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
            )}

            {/* Modal de Cadastro/Edição */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                            <h3 className="font-semibold text-lg text-slate-900">
                                {editingMember ? 'Editar Membro' : 'Novo Membro'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="member-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Imagem e Ajuste */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-24 h-24 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center relative shrink-0 overflow-hidden">
                                        {fotoUrl ? (
                                            <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-slate-300" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Foto de Perfil</label>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Ajuste da Imagem (se Lattes não for quadrada)</label>
                                            <Controller
                                                name="foto_posicao"
                                                control={control}
                                                render={({ field }) => (
                                                    <Dropdown
                                                        value={field.value || 'center center'}
                                                        onChange={field.onChange}
                                                        options={[
                                                            { label: 'Alinhar no Topo', value: 'center top' },
                                                            { label: 'Centralizar (Padrão)', value: 'center center' },
                                                            { label: 'Alinhar Embaixo', value: 'center bottom' }
                                                        ]}
                                                        placeholder="Ajuste..."
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                                        <input {...register('nome')} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm" />
                                        {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cargo *</label>
                                        <Controller
                                            name="cargo"
                                            control={control}
                                            render={({ field }) => (
                                                <Dropdown
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={['Docente', 'Mestrando', 'Graduação', 'Egresso']}
                                                    placeholder="Selecione..."
                                                />
                                            )}
                                        />
                                        {errors.cargo && <p className="text-red-500 text-xs mt-1">{errors.cargo.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Área de Pesquisa</label>
                                        <input {...register('area_pesquisa')} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                                        <input 
                                            {...register('cpf')} 
                                            onChange={(e) => {
                                                let v = e.target.value.replace(/\D/g, "");
                                                if (v.length > 11) v = v.substring(0, 11);
                                                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                                                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                                                v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                                                setValue('cpf', v);
                                            }}
                                            placeholder="000.000.000-00" 
                                            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                                        <input type="email" {...register('email')} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm" />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                    </div>
                                </div>

                                {/* Seção Declarações (Dados do GSIPP) */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Dados para Declaração</h4>
                                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Matrícula</label>
                                            <input {...register('matricula')} className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Curso</label>
                                            <Controller
                                                name="curso"
                                                control={control}
                                                render={({ field }) => (
                                                    <Dropdown
                                                        value={field.value || ''}
                                                        onChange={field.onChange}
                                                        options={['Ciência da Computação', 'Sistemas de Informação', 'Engenharia de Software', 'Outro']}
                                                        placeholder="Selecione..."
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Orientador</label>
                                            <input {...register('orientador')} className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Carga Horária (Ex: 04h)</label>
                                            <input {...register('carga_horaria')} className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Total de Horas</label>
                                            <input {...register('total_horas')} className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Prioridade (Ordem Exibição)</label>
                                            <input type="number" {...register('ordem')} className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Data de Entrada</label>
                                            <input type="date" {...register('data_entrada')} className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Data de Saída (Opcional)</label>
                                            <input type="date" {...register('data_saida')} className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Data p/ Declaração (Opcional)</label>
                                            <input type="date" {...register('data_declaracao')} title="Usado na geração da declaração atual" className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100" />
                                        </div>
                                    </div>
                                </div>

                                {/* Redes */}
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Links e Perfis</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Link Lattes</label>
                                            <input type="url" {...register('lattes_url')} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm" />
                                            {errors.lattes_url && <p className="text-red-500 text-xs mt-1">{errors.lattes_url.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">ID Lattes (Apenas o número)</label>
                                            <input {...register('lattes_id')} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
                                            <input type="url" {...register('linkedin_url')} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm" />
                                            {errors.linkedin_url && <p className="text-red-500 text-xs mt-1">{errors.linkedin_url.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">ResearchGate</label>
                                            <input type="url" {...register('researchgate_url')} className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm" />
                                            {errors.researchgate_url && <p className="text-red-500 text-xs mt-1">{errors.researchgate_url.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors cursor-pointer">
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                form="member-form"
                                disabled={isSubmitting || uploading}
                                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                            >
                                {(isSubmitting || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Membro
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
