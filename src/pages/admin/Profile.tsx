import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { 
    User, Mail, Shield, Save, Loader2, Key, CheckCircle2, 
    Upload, GraduationCap,
    FileText, Briefcase, UserCircle, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkedinIcon, GithubIcon } from '../../components/BrandIcons';

const LattesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={className}>
        <path d="M 97.871854,434.73261 C 51.534463,339.78442 23.965602,282.44369 23.965602,281.02029 c 0,-2.32214 2.831558,-1.99974 30.672084,3.45957 48.965204,9.61389 75.126384,12.32631 118.735104,12.34258 57.69707,0.0159 104.6807,-9.1222 141.18473,-27.4842 19.31194,-9.71476 30.92555,-18.32755 40.43708,-29.99337 11.716,-14.37824 15.47977,-24.28004 15.61512,-40.94646 0.11867,-15.85237 -2.01801,-24.21167 -11.19035,-43.60874 -3.62892,-7.66433 -6.8168,-16.46265 -7.12098,-19.54964 -0.47493,-4.96814 -0.0684,-5.68084 3.59445,-6.10361 8.00292,-0.94846 47.50732,37.40224 62.05491,60.24069 25.07592,39.38574 27.11161,81.99337 5.88408,123.1953 -13.03903,25.31314 -27.44972,42.82712 -51.57723,62.73362 -40.09844,33.06211 -86.70754,56.08608 -151.06833,74.63514 C 186.61557,459.91141 130.71496,472 119.20225,472 c -2.44075,0 -7.02006,-8.00296 -21.295953,-37.28315 l -0.03402,0.0151 z M 110.77601,281.61191 C 65.760136,275.77998 27.985273,270.70947 26.81537,270.33687 24.815625,269.6926 17.660677,245.82107 13.624773,226.39004 12.607902,221.4726 11.11559,208.45131 10.30202,197.43174 6.6716589,148.26132 17.370799,114.26648 46.041165,83.697237 94.583571,31.98518 198.51713,25.694031 315.77765,67.369458 c 20.58274,7.324215 28.75504,12.410983 24.975,15.580668 -2.79708,2.339846 -21.75315,2.305883 -54.50916,-0.102387 -51.20464,-3.763759 -90.18335,3.357226 -110.27491,20.176211 -30.58742,25.60158 -25.92345,81.72365 13.53071,162.68196 4.27316,8.76586 8.57881,17.34466 9.56318,19.09094 2.28966,4.01773 0.62803,7.74899 -3.3572,7.56196 -1.69755,-0.0813 -39.91486,-4.91203 -84.92926,-10.74592 z m 151.01614,-44.04726 c -35.92814,-6.45997 -68.22691,-28.7388 -78.65437,-54.22127 -5.00209,-12.24165 -4.76437,-28.2131 0.57585,-37.77483 4.83279,-8.64723 17.3107,-18.64993 28.48481,-22.83843 18.59924,-6.96791 51.17019,-4.18853 74.90688,6.40975 22.53229,10.05487 42.50672,27.73816 49.93183,44.18457 9.52925,21.10841 1.59321,44.65955 -18.82072,55.90059 -13.5307,7.44285 -39.82676,11.32572 -56.44249,8.34109 h 0.0181 z" />
    </svg>
);

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        name: user?.user_metadata?.full_name ?? '',
        title: user?.user_metadata?.professional_title ?? '',
        bio: user?.user_metadata?.bio ?? '',
        linkedin: user?.user_metadata?.linkedin_url ?? '',
        github: user?.user_metadata?.github_url ?? '',
        lattes: user?.user_metadata?.lattes_url ?? '',
        scholar: user?.user_metadata?.scholar_url ?? '',
        orcid: user?.user_metadata?.orcid_id ?? '',
        avatar_url: user?.user_metadata?.avatar_url ?? ''
    });

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({
            data: { 
                full_name: formData.name,
                professional_title: formData.title,
                bio: formData.bio,
                linkedin_url: formData.linkedin,
                github_url: formData.github,
                lattes_url: formData.lattes,
                scholar_url: formData.scholar,
                orcid_id: formData.orcid,
                avatar_url: formData.avatar_url
            }
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil: ' + error.message });
        } else {
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        }
        setLoading(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        setUploading(true);
        setMessage(null);

        try {
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
            
            // Auto-update metadata with new avatar
            await supabase.auth.updateUser({
                data: { avatar_url: data.publicUrl }
            });

            setMessage({ type: 'success', text: 'Foto de perfil atualizada!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Erro no upload: ' + error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar senha: ' + error.message });
        } else {
            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center relative">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle className="w-16 h-16 text-slate-300" />
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all active:scale-95">
                            <Upload className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                        </label>
                    </div>
                    
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{formData.name || 'Seu Nome'}</h1>
                        <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-1">{formData.title || 'Título Profissional'}</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3 text-slate-400">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm font-medium">{user?.email}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 relative z-10">
                    <button 
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Salvar Tudo
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl flex items-center gap-3 border shadow-lg ${message.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        <p className="font-bold text-sm">{message.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio & Personal */}
                    <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="font-black text-lg text-slate-900 uppercase tracking-tight">Informações Gerais</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                                    placeholder="Ex: Dr. Lucas Campos Sales"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título / Cargo Profissional</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input 
                                        type="text" 
                                        value={formData.title} 
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-900"
                                        placeholder="Ex: Coordenador do GSIPP | Professor Doutor"
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Biografia / Resumo Profissional</label>
                                <textarea 
                                    rows={4}
                                    value={formData.bio} 
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium text-slate-700"
                                    placeholder="Conte um pouco sobre sua trajetória acadêmica e profissional..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Social & Research Presence */}
                    <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h2 className="font-black text-lg text-slate-900 uppercase tracking-tight">Presença Digital</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">LinkedIn</label>
                                <div className="relative">
                                    <LinkedinIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="url" 
                                        value={formData.linkedin} 
                                        onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-900 text-sm"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">GitHub</label>
                                <div className="relative">
                                    <GithubIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="url" 
                                        value={formData.github} 
                                        onChange={e => setFormData({ ...formData, github: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-900 text-sm"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Currículo Lattes</label>
                                <div className="relative">
                                    <LattesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-700" />
                                    <input 
                                        type="url" 
                                        value={formData.lattes} 
                                        onChange={e => setFormData({ ...formData, lattes: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-900 text-sm"
                                        placeholder="http://lattes.cnpq.br/..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Google Scholar</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                                    <input 
                                        type="url" 
                                        value={formData.scholar} 
                                        onChange={e => setFormData({ ...formData, scholar: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-900 text-sm"
                                        placeholder="https://scholar.google.com/..."
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ORCID ID</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                                    <input 
                                        type="text" 
                                        value={formData.orcid} 
                                        onChange={e => setFormData({ ...formData, orcid: e.target.value })}
                                        className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-900 text-sm"
                                        placeholder="0000-0000-0000-0000"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Controls Area */}
                <div className="space-y-8">
                    {/* Security Card */}
                    <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h2 className="font-black text-lg text-slate-900 uppercase tracking-tight">Segurança</h2>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nova Senha</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input 
                                        type="password" 
                                        required 
                                        minLength={6}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-5 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none font-bold text-slate-900"
                                        placeholder="******"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Confirmar Senha</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input 
                                        type="password" 
                                        required 
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-5 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all outline-none font-bold text-slate-900"
                                        placeholder="******"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-slate-900 text-white px-5 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                                Atualizar Senha
                            </button>
                        </form>
                    </section>

                    {/* Tip Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <h3 className="font-black text-xl mb-3 relative z-10">Perfil Público</h3>
                        <p className="text-blue-100 text-sm leading-relaxed relative z-10 opacity-90">
                            As informações cadastradas aqui podem ser utilizadas para gerar sua assinatura em notícias e publicações oficiais do grupo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
