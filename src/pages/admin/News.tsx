import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { Plus, Pencil, Trash2, X, Upload, Loader2, Save, Newspaper, Bold, Italic, List, Link as LinkIcon, Heading, Quote, Code } from 'lucide-react';


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

const News = () => {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingNews, setEditingNews] = useState<News | null>(null);
    const [formData, setFormData] = useState<Partial<News>>({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        if (!window.confirm('Tem certeza que deseja remover esta notícia?')) return;

        const { error } = await supabase.from('noticias').delete().eq('id', id);

        if (error) {
            alert('Erro ao deletar: ' + error.message);
        } else {
            setNews(news.filter(n => n.id !== id));
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

            if (error) alert('Erro ao atualizar: ' + error.message);
        } else {
            const { error } = await supabase
                .from('noticias')
                .insert([payload]);

            if (error) alert('Erro ao criar: ' + error.message);
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
            alert('Erro no upload da imagem: ' + uploadError.message);
        } else {
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFormData({ ...formData, imagem_capa_url: data.publicUrl });
        }
        setUploading(false);
    };

    const handleEdit = (newsItem: News) => {
        setEditingNews(newsItem);
        setFormData(newsItem);
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
        <div>
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
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-full md:w-64"
                            />
                            <button
                                onClick={handleCreate}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/30 whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" /> <span className="hidden md:inline">Nova Notícia</span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredNews.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                                    <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                        {item.imagem_capa_url ? (
                                            <img src={item.imagem_capa_url} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Newspaper className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="bg-white/90 p-2 rounded-lg text-gray-700 hover:text-purple-600 shadow-sm backdrop-blur-sm"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="bg-white/90 p-2 rounded-lg text-gray-700 hover:text-red-600 shadow-sm backdrop-blur-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="text-xs text-purple-600 font-semibold mb-2">
                                            {new Date(item.data_publicacao).toLocaleDateString()}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.titulo}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-3">{item.resumo}</p>
                                    </div>
                                </div>
                            ))}
                            {filteredNews.length === 0 && (
                                <div className="col-span-full py-16 text-center text-gray-400">
                                    Nenhuma notícia encontrada.
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {view === 'form' && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{editingNews ? 'Editar Notícia' : 'Nova Notícia'}</h2>
                            <p className="text-gray-500">Preencha os detalhes da notícia abaixo.</p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.titulo || ''}
                                            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-lg font-medium"
                                            placeholder="Título da notícia"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={formData.resumo || ''}
                                            onChange={e => setFormData({ ...formData, resumo: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
                                            placeholder="Uma breve descrição que aparecerá nos cards..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Publicação</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.data_publicacao ? formData.data_publicacao.split('T')[0] : ''}
                                            onChange={e => setFormData({ ...formData, data_publicacao: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capa da Notícia</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-300 transition-colors bg-gray-50 aspect-[4/5] max-w-sm mx-auto relative group cursor-pointer">
                                        {formData.imagem_capa_url ? (
                                            <img src={formData.imagem_capa_url} alt="Preview" className="w-full h-full object-cover rounded-lg absolute inset-0" />
                                        ) : (
                                            <div className="text-gray-400">
                                                <Upload className="w-12 h-12 mx-auto mb-3" />
                                                <span className="text-sm font-medium">Clique para upload da imagem</span>
                                                <span className="block text-xs mt-1 text-gray-400">Formato Vertical (1080x1350) recomendado</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg"></div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo Completo</label>
                                <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all">
                                    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
                                        <button type="button" onClick={() => insertFormat('**', '**')} className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900" title="Negrito">
                                            <Bold className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => insertFormat('*', '*')} className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900" title="Itálico">
                                            <Italic className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                        <button type="button" onClick={() => insertFormat('## ', '')} className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900" title="Título">
                                            <Heading className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => insertFormat('> ', '')} className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900" title="Citação">
                                            <Quote className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => insertFormat('```\n', '\n```')} className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900" title="Código">
                                            <Code className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                        <button type="button" onClick={() => insertFormat('- ', '')} className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900" title="Lista">
                                            <List className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => insertFormat('[', '](url)')} className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900" title="Link">
                                            <LinkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <textarea
                                        ref={textareaRef}
                                        rows={12}
                                        required
                                        value={formData.conteudo || ''}
                                        onChange={e => setFormData({ ...formData, conteudo: e.target.value })}
                                        className="w-full px-4 py-3 outline-none font-mono text-sm resize-y"
                                        placeholder="Escreva seu conteúdo aqui..."
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {editingNews ? 'Salvar Alterações' : 'Publicar Notícia'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default News;
