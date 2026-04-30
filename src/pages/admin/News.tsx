import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Save, Newspaper, Bold, Italic, List, Link as LinkIcon, Quote, Code, Eye, FileEdit, FileText, Layout, Maximize2, Table, Strikethrough, Minus, CheckSquare, Image as ImageIcon, Type, Heading1, Heading2, Heading3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '../../contexts/ToastContext';
import ConfirmModal from '../../components/admin/ConfirmModal';

// Types
interface News {
    id: string;
    titulo: string;
    slug: string;
    resumo: string;
    conteudo: string;
    imagem_capa_url: string;
    data_publicacao: string;
}

const NewsAdmin = () => {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [formData, setFormData] = useState<Partial<News>>({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [formTab, setFormTab] = useState<'write' | 'preview'>('write');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const toast = useToast();

    // Insert Markdown format
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

        setFormData({ ...formData, conteudo: newText });

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + startTag.length, end + startTag.length);
        }, 0);
    };

    // Keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            insertFormat('**', '**');
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            insertFormat('_', '_');
        }
    };

    const applyTemplate = (type: 'noticia' | 'evento' | 'pesquisa') => {
        const templates = {
            noticia: `# Título da Notícia\n\nIntrodução curta sobre o acontecimento...\n\n## Detalhes\n\nDesenvolvimento da notícia aqui...\n\n> "Citação de algum membro ou envolvido"\n\n## Conclusão\n\nPróximos passos ou fechamento.`,
            evento: `# Relatório de Evento: [Nome]\n\nO GSIPP participou do evento... no dia ...\n\n## Principais Destaques\n\n- Ponto 1\n- Ponto 2\n\n## Impacto\n\nComo isso ajuda o grupo e a pesquisa.`,
            pesquisa: `# Nova Descoberta em [Área]\n\nResumo da nova pesquisa ou publicação...\n\n## Metodologia\n\nComo foi feito...\n\n| Variável | Resultado |\n| :--- | :--- |\n| Teste 1 | 95% |\n| Teste 2 | 98% |`
        };
        
        if (formData.conteudo && !window.confirm('Isso irá substituir o conteúdo atual. Continuar?')) return;
        setFormData({ ...formData, conteudo: templates[type] });
        setFormTab('write');
    };

    const wordCount = (text: string) => text ? text.trim().split(/\s+/).length : 0;
    const charCount = (text: string) => text ? text.length : 0;

    // Generate slug helper
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD') // Separates accents
            .replace(/[\u0300-\u036f]/g, '') // Removes accents
            .replace(/[^a-z0-9\s-]/g, '') // Removes special chars
            .trim()
            .replace(/\s+/g, '-'); // Replaces spaces with hyphens
    };

    // Fetch news
    const fetchNews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('noticias')
            .select('*')
            .order('data_publicacao', { ascending: false });

        if (error) console.error('Error fetching news:', error);
        else setNews(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    // Filter news
    const filteredNews = news.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.resumo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Delete
    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('noticias').delete().eq('id', id);
        if (error) {
            toast.error('Erro ao excluir notícia: ' + error.message);
        } else {
            setNews(news.filter(n => n.id !== id));
            toast.success('Notícia removida com sucesso.');
        }
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            titulo: formData.titulo,
            slug: generateSlug(formData.titulo || ''),
            resumo: formData.resumo,
            conteudo: formData.conteudo,
            imagem_capa_url: formData.imagem_capa_url,
            data_publicacao: formData.data_publicacao || new Date().toISOString()
        };

        if (editingNews) {
            const { error } = await supabase
                .from('noticias')
                .update(payload)
                .eq('id', editingNews.id);

            if (error) toast.error('Erro ao atualizar: ' + error.message);
            else toast.success('Notícia atualizada com sucesso.');
        } else {
            const { error } = await supabase
                .from('noticias')
                .insert([payload]);

            if (error) toast.error('Erro ao publicar notícia: ' + error.message);
            else toast.success('Notícia publicada com sucesso.');
        }

        setSaving(false);
        setView('list');
        setEditingNews(null);
        setFormData({});
        fetchNews();
    };

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `news/${fileName}`;

        setUploading(true);
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
            toast.error('Erro no upload da imagem: ' + uploadError.message);
        } else {
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFormData({ ...formData, imagem_capa_url: data.publicUrl });
        }
        setUploading(false);
    };

    const handleEdit = (item: News) => {
        setEditingNews(item);
        const dataPub = item.data_publicacao ? item.data_publicacao.split('T')[0] : '';
        setFormData({
            ...item,
            data_publicacao: dataPub
        });
        setView('form');
    };

    const handleCreate = () => {
        setEditingNews(null);
        setFormData({ data_publicacao: new Date().toISOString().split('T')[0] });
        setView('form');
    };

    const handleCancel = () => {
        setView('list');
        setEditingNews(null);
        setFormData({});
    };

    return (
        <div className="w-full">
            {view === 'list' && (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notícias</h1>
                            <p className="text-gray-500">Gerencie as notícias e atualizações do GSIPP.</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Buscar notícia..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full md:w-64"
                            />
                            <button
                                onClick={handleCreate}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30 whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" /> <span className="hidden md:inline">Nova Notícia</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredNews.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-6 group hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                                        {item.imagem_capa_url ? (
                                            <img src={item.imagem_capa_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Newspaper className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                                                {(() => {
                                                    const [year, month, day] = item.data_publicacao.split('T')[0].split('-').map(Number);
                                                    return new Date(year, month - 1, day, 12, 0, 0).toLocaleDateString('pt-BR');
                                                })()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 truncate text-lg">{item.titulo}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">{item.resumo}</p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-3 hover:bg-blue-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all"
                                            title="Editar"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(item.id)}
                                            className="p-3 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredNews.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Newspaper className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-medium">Nenhuma notícia encontrada.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {view === 'form' && (
                <div className={`mx-auto pb-20 ${isFullScreen ? 'fixed inset-0 z-[100] bg-gray-50 overflow-auto' : 'max-w-[1400px]'}`}>
                    <div className={`flex items-center justify-between mb-8 ${isFullScreen ? 'p-6 border-b bg-white' : ''}`}>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{editingNews ? 'Editar Notícia' : 'Nova Notícia'}</h2>
                            <p className="text-gray-500">Preencha os detalhes da notícia abaixo.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
                                title="Tela Cheia"
                            >
                                <Maximize2 className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className={`space-y-8 ${isFullScreen ? 'p-8 max-w-7xl mx-auto' : ''}`}>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Main Content Columns */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Notícia</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.titulo || ''}
                                                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-2xl font-bold placeholder:text-gray-300"
                                                placeholder="Como o GSIPP desenvolve novas tecnologias..."
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Resumo / Subtítulo</label>
                                            <textarea
                                                rows={3}
                                                required
                                                value={formData.resumo || ''}
                                                onChange={e => setFormData({ ...formData, resumo: e.target.value })}
                                                className="w-full px-5 py-3 rounded-xl border border-gray-200 text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-300"
                                                placeholder="Um texto curto para captar a atenção do leitor nos cards..."
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md py-4 mb-4 border-b border-gray-100 -mx-8 px-8">
                                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                                    <div className="flex p-1 bg-gray-100 rounded-xl w-fit shrink-0">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setFormTab('write')}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${formTab === 'write' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            <FileEdit className="w-4 h-4" /> Escrever
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setFormTab('preview')}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${formTab === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                        >
                                                            <Eye className="w-4 h-4" /> Visualizar
                                                        </button>
                                                    </div>

                                                    {formTab === 'write' && (
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            {/* Text Formatting Group */}
                                                            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                                <button type="button" onClick={() => insertFormat('**', '**')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Negrito (Ctrl+B)"><Bold className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('_', '_')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Itálico (Ctrl+I)"><Italic className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('~~', '~~')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Tachado"><Strikethrough className="w-4 h-4" /></button>
                                                            </div>

                                                            {/* Headings Group */}
                                                            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                                <button type="button" onClick={() => insertFormat('# ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Título 1"><Heading1 className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('## ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Título 2"><Heading2 className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('### ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Título 3"><Heading3 className="w-4 h-4" /></button>
                                                            </div>

                                                            {/* List & Structure Group */}
                                                            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                                <button type="button" onClick={() => insertFormat('- ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Lista Simples"><List className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('- [ ] ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Lista de Tarefas"><CheckSquare className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('> ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Citação"><Quote className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('\n---\n', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Linha Divisória"><Minus className="w-4 h-4" /></button>
                                                            </div>

                                                            {/* Media & Links Group */}
                                                            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                                                <button type="button" onClick={() => insertFormat('[', '](url)')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Inserir Link"><LinkIcon className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('![alt](', ')') } className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Inserir Imagem"><ImageIcon className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('| Coluna 1 | Coluna 2 |\n| :--- | :--- |\n| Linha 1 | Dado 1 |\n', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Tabela"><Table className="w-4 h-4" /></button>
                                                                <button type="button" onClick={() => insertFormat('```\n', '\n```')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Código"><Code className="w-4 h-4" /></button>
                                                            </div>

                                                            <div className="flex gap-1 bg-blue-50/50 p-1 rounded-xl border border-blue-100">
                                                                <span className="p-2 text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><Layout className="w-3.5 h-3.5" /> Modelos:</span>
                                                                <button type="button" onClick={() => applyTemplate('noticia')} className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-bold text-blue-600 transition-all uppercase tracking-widest">Notícia</button>
                                                                <button type="button" onClick={() => applyTemplate('evento')} className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-bold text-blue-600 transition-all uppercase tracking-widest">Evento</button>
                                                                <button type="button" onClick={() => applyTemplate('pesquisa')} className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-bold text-blue-600 transition-all uppercase tracking-widest">Pesquisa</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {formTab === 'write' ? (
                                                <div className="relative">
                                                    <textarea
                                                        ref={textareaRef}
                                                        rows={25}
                                                        required
                                                        value={formData.conteudo || ''}
                                                        onChange={e => setFormData({ ...formData, conteudo: e.target.value })}
                                                        onKeyDown={handleKeyDown}
                                                        className="w-full px-8 py-8 rounded-2xl border border-gray-100 text-gray-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 outline-none transition-all font-mono text-sm leading-relaxed bg-gray-50/20 min-h-[600px] shadow-sm"
                                                        placeholder="Escreva sua notícia aqui usando Markdown..."
                                                    />
                                                    <div className="absolute bottom-4 right-6 flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                                                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-blue-500" /> {wordCount(formData.conteudo || '')} palavras</span>
                                                        <span className="w-px h-3 bg-gray-200"></span>
                                                        <span>{charCount(formData.conteudo || '')} caracteres</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full min-h-[500px] px-8 py-8 rounded-2xl border border-gray-200 bg-white overflow-auto prose prose-slate prose-blue max-w-none">
                                                    {formData.conteudo ? (
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {formData.conteudo}
                                                        </ReactMarkdown>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center text-gray-400 italic">
                                                            Nada para visualizar ainda...
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Column */}
                                <div className="space-y-8">
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <label className="block text-sm font-medium text-gray-700 mb-4">Configurações da Notícia</label>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data de Publicação</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.data_publicacao ? formData.data_publicacao.split('T')[0] : ''}
                                                    onChange={e => setFormData({ ...formData, data_publicacao: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">URL Base (Slug)</label>
                                                <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 text-sm break-all font-mono">
                                                    /{generateSlug(formData.titulo || 'titulo-da-noticia')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Capa da Notícia</label>
                                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-400 transition-all bg-white aspect-[16/10] relative group cursor-pointer overflow-hidden shadow-sm">
                                            {formData.imagem_capa_url ? (
                                                <>
                                                    <img src={formData.imagem_capa_url} alt="Preview" className="w-full h-full object-cover rounded-xl absolute inset-0" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white font-medium px-4 py-2 border border-white/40 rounded-full backdrop-blur-sm">Mudar Foto</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-gray-400">
                                                    <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                    <span className="text-sm font-medium">Arraste ou clique para upload</span>
                                                    <span className="block text-xs mt-1 text-gray-400">Horizontal (1920x1080) sugerido</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                                                        <span className="text-sm font-bold text-gray-600">Enviando...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            {saving ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Salvando...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <Save className="w-5 h-5" />
                                                    {editingNews ? 'Salvar Alterações' : 'Publicar Notícia'}
                                                </div>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="w-full mt-3 px-6 py-3 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-100 transition-colors"
                                        >
                                            Cancelar e Voltar
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
