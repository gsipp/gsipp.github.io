import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { Plus, Pencil, Trash2, X, MapPin, Loader2, Save, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Event {
    id: string;
    titulo: string;
    descricao: string;
    data_evento: string;
    local: string;
    horario: string;
}

const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState<Partial<Event>>({});
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch events
    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .order('data_evento', { ascending: true });

        if (error) console.error('Error fetching events:', error);
        else setEvents(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Filter events
    const filteredEvents = events.filter(event =>
        event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.local?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Delete
    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja remover este evento?')) return;
        const { error } = await supabase.from('eventos').delete().eq('id', id);
        if (error) alert('Erro ao deletar: ' + error.message);
        else setEvents(events.filter(e => e.id !== id));
    };

    // Handle Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            titulo: formData.titulo,
            descricao: formData.descricao,
            data_evento: formData.data_evento,
            local: formData.local,
            horario: formData.horario
        };

        if (editingEvent) {
            const { error } = await supabase.from('eventos').update(payload).eq('id', editingEvent.id);
            if (error) alert('Erro ao atualizar: ' + error.message);
        } else {
            const { error } = await supabase.from('eventos').insert([payload]);
            if (error) alert('Erro ao criar: ' + error.message);
        }

        setSaving(false);
        setIsModalOpen(false);
        setEditingEvent(null);
        setFormData({});
        fetchEvents();
    };

    const openModal = (event?: Event) => {
        if (event) {
            setEditingEvent(event);
            setFormData(event);
        } else {
            setEditingEvent(null);
            setFormData({ data_evento: new Date().toISOString().split('T')[0] });
        }
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
                    <p className="text-gray-500">Gerencie a agenda e calendário.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar evento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-full md:w-64"
                    />
                    <button
                        onClick={() => openModal()}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/30 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> <span className="hidden md:inline">Novo Evento</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group hover:shadow-md transition-all">
                            <div className="flex-shrink-0 bg-amber-50 text-amber-600 w-16 h-16 rounded-2xl flex flex-col items-center justify-center border border-amber-100">
                                <span className="text-xs font-bold uppercase">{new Date(event.data_evento).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-2xl font-bold leading-none">{new Date(event.data_evento).getDate()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{event.titulo}</h3>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {event.horario || '00:00'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {event.local || 'Online'}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{event.descricao}</p>
                            </div>
                            <div className="flex flex-col gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(event)} className="p-2 hover:bg-amber-50 text-gray-400 hover:text-amber-600 rounded-lg transition-colors">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredEvents.length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-400">
                            Nenhum evento agendado.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-900">{editingEvent ? 'Editar Evento' : 'Novo Evento'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento</label>
                                    <input type="text" required value={formData.titulo || ''} onChange={e => setFormData({ ...formData, titulo: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-gray-400" placeholder="Ex: Workshop de Segurança" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                        <input type="date" required value={formData.data_evento ? formData.data_evento.split('T')[0] : ''} onChange={e => setFormData({ ...formData, data_evento: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                                        <input type="time" value={formData.horario || ''} onChange={e => setFormData({ ...formData, horario: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                        <input type="text" value={formData.local || ''} onChange={e => setFormData({ ...formData, local: e.target.value })} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-gray-400" placeholder="Ex: Auditório A ou Google Meet" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <textarea rows={4} value={formData.descricao || ''} onChange={e => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all resize-none placeholder:text-gray-400" placeholder="Detalhes adicionais sobre o evento..." />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/30 disabled:opacity-70">
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editingEvent ? 'Salvar' : 'Agendar'}
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

export default Events;
