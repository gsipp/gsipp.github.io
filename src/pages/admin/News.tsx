import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Save, Newspaper, Bold, Italic, List, Link as LinkIcon, Quote, Code, Eye, FileEdit, Layout, Maximize2, Strikethrough, Image as ImageIcon, Heading1, Search, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';

import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Types
interface News {
    id: string;
    titulo: string;
    slug: string;
    resumo: string;
    conteudo: string;
    imagem_capa_url: string;
    data_publicacao: string;
    publicado: boolean;
    tags: string[];
}

const newsSchema = z.object({
    titulo: z.string().min(3, "Título é obrigatório"),
    resumo: z.string().min(10, "Resumo é obrigatório (min. 10 caracteres)"),
    conteudo: z.string().min(10, "Conteúdo é obrigatório"),
    data_publicacao: z.string().min(1, "Data é obrigatória"),
    publicado: z.boolean().default(false),
    imagem_capa_url: z.string().optional().nullable(),
    tags: z.array(z.string()).default([])
});



// Helper for Slug
const generateSlug = (title: string) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .normalize('NFD') // Separates accents
        .replace(/[\u0300-\u036f]/g, '') // Removes accents
        .replace(/[^a-z0-9\s-]/g, '') // Removes special chars
        .trim()
        .replace(/\s+/g, '-'); // Replaces spaces with hyphens
};

const NewsAdmin = () => {
    const [newsList, setNewsList] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    
    // Editor State
    const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('write');
    const [tagInput, setTagInput] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const toast = useToast();

    const { register, handleSubmit, reset, setValue, watch, control, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(newsSchema),
        defaultValues: { tags: [], publicado: true, conteudo: '' }
    });

    const watchedTitulo = watch('titulo');
    const watchedConteudo = watch('conteudo');
    const watchedCapaUrl = watch('imagem_capa_url');
    const watchedTags = watch('tags') || [];

    const fetchNews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('noticias')
            .select('*')
            .order('data_publicacao', { ascending: false });

        if (error) console.error('Error fetching news:', error);
        else setNewsList(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const filteredNews = newsList.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.resumo && item.resumo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('noticias').delete().eq('id', id);
        if (error) {
            toast.error('Erro ao excluir notícia: ' + (error as Error).message);
        } else {
            setNewsList(newsList.filter(n => n.id !== id));
            toast.success('Notícia removida com sucesso.');
        }
    };

    const onSubmit = async (data: Record<string, unknown>, isPublished: boolean) => {
        const payload = {
            ...data,
            slug: generateSlug(data.titulo),
            publicado: isPublished,
            imagem_capa_url: data.imagem_capa_url || '',
        };

        if (editingNews) {
            const { error } = await supabase.from('noticias').update(payload).eq('id', editingNews.id);
            if (error) toast.error('Erro ao atualizar: ' + (error as Error).message);
            else {
                toast.success(isPublished ? 'Notícia atualizada e publicada!' : 'Alterações salvas como rascunho.');
                fetchNews();
                handleCancel();
            }
        } else {
            const { error } = await supabase.from('noticias').insert([payload]);
            if (error) toast.error('Erro ao salvar notícia: ' + (error as Error).message);
            else {
                toast.success(isPublished ? 'Notícia publicada com sucesso!' : 'Notícia salva como rascunho.');
                fetchNews();
                handleCancel();
            }
        }
    };

    // Imagem da Capa
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `news/${fileName}`;

        setUploading(true);
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

        if (uploadError) {
            toast.error('Erro no upload da imagem: ' + uploadError.message);
        } else {
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setValue('imagem_capa_url', data.publicUrl);
        }
        setUploading(false);
    };

    // Imagem do Conteúdo
    const handleContentImageUpload = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `news/content/${fileName}`;

        setUploading(true);
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

        if (uploadError) {
            toast.error('Erro no upload da imagem: ' + uploadError.message);
        } else {
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            const markdownImage = `\n![imagem](${data.publicUrl})\n`;
            
            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const text = textarea.value;
                const before = text.substring(0, start);
                const after = text.substring(end);
                setValue('conteudo', before + markdownImage + after, { shouldValidate: true });
            }
        }
        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files[0] && files[0].type.startsWith('image/')) {
            handleContentImageUpload(files[0]);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) handleContentImageUpload(file);
            }
        }
    };

    const insertFormat = (startTag: string, endTag: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + startTag + selection + endTag + after;
        setValue('conteudo', newText, { shouldValidate: true });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + startTag.length, end + startTag.length);
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            insertFormat('**', '**');
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            insertFormat('_', '_');
        }
    };

    const addTag = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') return;
        if (e) e.preventDefault();

        const tag = tagInput.trim().toLowerCase();
        if (tag && !watchedTags.includes(tag)) {
            setValue('tags', [...watchedTags, tag]);
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', watchedTags.filter(t => t !== tagToRemove));
    };

    const handleEdit = (item: News) => {
        setEditingNews(item);
        const dataPub = item.data_publicacao ? item.data_publicacao.split('T')[0] : '';
        reset({
            titulo: item.titulo,
            resumo: item.resumo,
            conteudo: item.conteudo,
            data_publicacao: dataPub,
            tags: item.tags || [],
            publicado: item.publicado,
            imagem_capa_url: item.imagem_capa_url
        });
        setView('form');
    };

    const handleCreate = () => {
        setEditingNews(null);
        reset({
            titulo: '',
            resumo: '',
            conteudo: '',
            data_publicacao: new Date().toISOString().split('T')[0],
            tags: [],
            publicado: true,
            imagem_capa_url: ''
        });
        setView('form');
    };

    const handleCancel = () => {
        setView('list');
        setEditingNews(null);
        reset();
    };

    const wordCount = (text: string) => text ? text.trim().split(/\s+/).length : 0;
    const charCount = (text: string) => text ? text.length : 0;

    return (
        <div className="space-y-6">
            {view === 'list' && (
                <>
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Notícias</h1>
                            <p className="text-sm text-slate-500 mt-1">Gerencie as publicações do blog e avisos.</p>
                        </div>
                        <div className="flex w-full sm:w-auto gap-3">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar notícia..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
                                />
                            </div>
                            <button
                                onClick={handleCreate}
                                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" /> Nova Notícia
                            </button>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                        </div>
                    ) : filteredNews.length === 0 ? (
                        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhuma notícia encontrada</h3>
                            <p className="text-slate-500">Comece a escrever novidades sobre o grupo.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 font-medium text-slate-500 w-16">Capa</th>
                                            <th className="px-6 py-3 font-medium text-slate-500 w-1/2">Título</th>
                                            <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                                            <th className="px-6 py-3 font-medium text-slate-500 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredNews.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="w-16 h-12 rounded border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                                                        {item.imagem_capa_url ? (
                                                            <img src={item.imagem_capa_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Newspaper className="w-5 h-5 text-slate-300" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 truncate max-w-sm">{item.titulo}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-sm mt-0.5">{item.resumo}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        {item.publicado ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 w-fit">
                                                                Publicado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 w-fit">
                                                                Rascunho
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-slate-500">
                                                            {item.data_publicacao ? new Date(item.data_publicacao).toLocaleDateString('pt-BR') : '--'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(item.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {view === 'form' && (
                <div className={`mx-auto pb-10 ${isFullScreen ? 'fixed inset-0 z-[100] bg-slate-50 overflow-auto' : ''}`}>
                    <div className={`flex items-center justify-between mb-6 ${isFullScreen ? 'p-6 border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm' : ''}`}>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{editingNews ? 'Editar Notícia' : 'Nova Notícia'}</h2>
                            <p className="text-sm text-slate-500">Crie ou edite o conteúdo em Markdown.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="p-2 text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
                                title={isFullScreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                            >
                                <Maximize2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-2 text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
                                title="Fechar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <form id="news-form" className={`space-y-6 ${isFullScreen ? 'p-6 max-w-7xl mx-auto' : ''}`}>
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                                
                                {/* Editor de Texto e Meta */}
                                <div className="lg:col-span-2 p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Título da Notícia *</label>
                                            <input
                                                {...register('titulo')}
                                                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-lg font-semibold placeholder:text-slate-400"
                                                placeholder="Ex: Novo projeto aprovado no edital CNPq..."
                                            />
                                            {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Resumo *</label>
                                            <textarea
                                                {...register('resumo')}
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm resize-none placeholder:text-slate-400"
                                                placeholder="Um pequeno resumo para exibição nos cards..."
                                            />
                                            {errors.resumo && <p className="text-red-500 text-xs mt-1">{errors.resumo.message}</p>}
                                        </div>
                                    </div>

                                    {/* Toolbar do Markdown */}
                                    <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-50 flex flex-col">
                                        <div className="bg-slate-100 border-b border-slate-200 p-2 flex flex-wrap items-center gap-2">
                                            {/* Modos */}
                                            <div className="flex bg-slate-200/50 p-1 rounded-md text-sm font-medium text-slate-600">
                                                <button type="button" onClick={() => setViewMode('write')} className={`px-3 py-1 rounded ${viewMode === 'write' ? 'bg-white shadow-sm text-slate-900' : 'hover:bg-slate-200'}`}><FileEdit className="w-4 h-4 inline-block mr-1" />Editar</button>
                                                <button type="button" onClick={() => setViewMode('split')} className={`hidden md:inline-block px-3 py-1 rounded ${viewMode === 'split' ? 'bg-white shadow-sm text-slate-900' : 'hover:bg-slate-200'}`}><Layout className="w-4 h-4 inline-block mr-1" />Lado a Lado</button>
                                                <button type="button" onClick={() => setViewMode('preview')} className={`px-3 py-1 rounded ${viewMode === 'preview' ? 'bg-white shadow-sm text-slate-900' : 'hover:bg-slate-200'}`}><Eye className="w-4 h-4 inline-block mr-1" />Visualizar</button>
                                            </div>

                                            <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block"></div>

                                            {/* Tools */}
                                            {viewMode !== 'preview' && (
                                                <div className="flex items-center gap-1">
                                                    <button type="button" onClick={() => insertFormat('**', '**')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Negrito"><Bold className="w-4 h-4" /></button>
                                                    <button type="button" onClick={() => insertFormat('_', '_')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Itálico"><Italic className="w-4 h-4" /></button>
                                                    <button type="button" onClick={() => insertFormat('~~', '~~')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Riscado"><Strikethrough className="w-4 h-4" /></button>
                                                    
                                                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                                    
                                                    <button type="button" onClick={() => insertFormat('# ', '')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Título"><Heading1 className="w-4 h-4" /></button>
                                                    <button type="button" onClick={() => insertFormat('- ', '')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Lista"><List className="w-4 h-4" /></button>
                                                    <button type="button" onClick={() => insertFormat('> ', '')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Citação"><Quote className="w-4 h-4" /></button>
                                                    
                                                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                                    
                                                    <button type="button" onClick={() => insertFormat('[', '](url)')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Link"><LinkIcon className="w-4 h-4" /></button>
                                                    <button type="button" onClick={() => insertFormat('![alt](', ')')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Imagem"><ImageIcon className="w-4 h-4" /></button>
                                                    <button type="button" onClick={() => insertFormat('```\n', '\n```')} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" title="Código"><Code className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                        </div>

                                        <div className={`grid ${viewMode === 'split' ? 'grid-cols-2 divide-x divide-slate-200' : 'grid-cols-1'}`}>
                                            {(viewMode === 'write' || viewMode === 'split') && (
                                                <div className="relative">
                                                    <Controller
                                                        name="conteudo"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <textarea
                                                                {...field}
                                                                ref={(e) => {
                                                                    field.ref(e);
                                                                    textareaRef.current = e;
                                                                }}
                                                                onKeyDown={handleKeyDown}
                                                                onDrop={handleDrop}
                                                                onPaste={handlePaste}
                                                                className="w-full p-4 min-h-[400px] outline-none font-mono text-sm resize-y bg-slate-50"
                                                                placeholder="Escreva em Markdown aqui..."
                                                            />
                                                        )}
                                                    />
                                                    {errors.conteudo && <p className="absolute bottom-2 left-4 text-red-500 text-xs bg-white px-1">{errors.conteudo.message}</p>}
                                                </div>
                                            )}
                                            {(viewMode === 'preview' || viewMode === 'split') && (
                                                <div className="p-6 min-h-[400px] bg-white prose prose-slate prose-sm max-w-none overflow-y-auto">
                                                    {watchedConteudo ? (
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{watchedConteudo}</ReactMarkdown>
                                                    ) : (
                                                        <p className="text-slate-400 italic">Preview do conteúdo...</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-slate-100 p-2 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                                            <span>Formatos Suportados: Markdown</span>
                                            <span className="flex gap-4">
                                                <span>{wordCount(watchedConteudo)} palavras</span>
                                                <span>{charCount(watchedConteudo)} chars</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div className="p-6 bg-slate-50 space-y-6">
                                    {/* Capa */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Imagem de Capa</label>
                                        <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-100 transition-colors bg-white relative overflow-hidden aspect-video flex items-center justify-center">
                                            {watchedCapaUrl ? (
                                                <>
                                                    <img src={watchedCapaUrl} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-xs font-medium px-3 py-1 border border-white/30 rounded-full backdrop-blur-sm">Alterar Capa</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-slate-400">
                                                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <span className="text-xs font-medium block">Upload de Imagem</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                                            <input type="date" {...register('data_publicacao')} className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white" />
                                            {errors.data_publicacao && <p className="text-red-500 text-xs mt-1">{errors.data_publicacao.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={e => setTagInput(e.target.value)}
                                                    onKeyDown={addTag}
                                                    placeholder="Nova tag..."
                                                    className="w-full px-3 py-1.5 text-sm rounded border border-slate-300 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white"
                                                />
                                                <button type="button" onClick={() => addTag()} className="px-3 bg-slate-200 text-slate-700 rounded hover:bg-slate-300">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {watchedTags.map(tag => (
                                                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs">
                                                        {tag}
                                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Slug Automático</label>
                                            <div className="px-3 py-1.5 bg-slate-200 rounded text-slate-600 text-xs font-mono truncate">
                                                /{generateSlug(watchedTitulo)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações Finais */}
                                    <div className="pt-6 border-t border-slate-200 space-y-3">
                                        <button
                                            type="button"
                                            onClick={handleSubmit((data) => onSubmit(data, true))}
                                            disabled={isSubmitting || uploading}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Publicar Notícia
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit((data) => onSubmit(data, false))}
                                            disabled={isSubmitting || uploading}
                                            className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            Salvar como Rascunho
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Remover notícia"
                description="Tem certeza que deseja remover esta notícia? Esta ação não pode ser desfeita."
                onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default NewsAdmin;
