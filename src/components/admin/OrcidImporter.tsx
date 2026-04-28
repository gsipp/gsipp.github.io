import { useState, useEffect } from 'react';
import { Search, Loader2, X, Check, Database, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabaseClient';

interface OrcidWork {
    id: string;
    title: string;
    year: number;
    url: string;
    type: string;
    authors: string;
    orientador?: string;
    co_orientador?: string;
    selected: boolean;
    isGsipp: boolean; // Badge de pertencimento ao grupo
}

interface Member {
    id: string;
    nome: string;
    orientador: string | null;
    lattes_id: string | null;
}

interface OrcidImporterProps {
    onImport: (works: any[]) => void;
    onClose: () => void;
}

const CLIENT_ID = 'APP-7NQ0GJLPLEQLRDFM';
const CLIENT_SECRET = 'cc9277c9-d1cd-4784-b2a4-1469951289ae';

const typeMapping: Record<string, string> = {
    'JOURNAL_ARTICLE': 'Artigo em Periódico',
    'CONFERENCE_PAPER': 'Artigo em Conferência',
    'BOOK': 'Livro',
    'BOOK_CHAPTER': 'Capítulo de Livro',
    'DISSERTATION': 'Dissertação',
    'THESIS': 'Tese',
    'PREPRINT': 'Preprint',
    'PROCEEDINGS_ARTICLE': 'Artigo em Conferência'
};

// Extrai sobrenome e iniciais de um nome completo para matching flexível
const extractNameParts = (fullName: string) => {
    const normalized = fullName.toUpperCase().replace(/[.,]/g, '').trim();
    const parts = normalized.split(/\s+/);
    // O sobrenome pode ser a primeira ou última palavra dependendo do formato
    const surname = parts[0]; // Ex: "TOMAZ"
    const initials = parts.slice(1).map(p => p[0]).filter(Boolean); // Ex: ['A', 'E', 'B']
    return { surname, initials };
};

// Verifica se o nome do orientador aparece na string de contribuidores
const matchesAdvisor = (advisorName: string, contributorsStr: string): boolean => {
    if (!advisorName || !contributorsStr) return false;
    const { surname, initials } = extractNameParts(advisorName);
    const normalizedContribs = contributorsStr.toUpperCase();

    if (!normalizedContribs.includes(surname)) return false;

    // Verifica se pelo menos uma inicial bate
    return initials.some(initial => {
        const regex = new RegExp(`${surname}[\\s,]+${initial}|${initial}[\\s.]+.*${surname}`, 'i');
        return regex.test(contributorsStr) || normalizedContribs.includes(`${surname}, ${initial}`);
    });
};

const OrcidImporter = (props: OrcidImporterProps) => {
    const { onImport, onClose } = props;
    const [orcid, setOrcid] = useState('');
    const [doi, setDoi] = useState('');
    const [ufcUrl, setUfcUrl] = useState('');
    const [importMode, setImportMode] = useState<'orcid' | 'doi' | 'ufc'>('orcid');
    const [loading, setLoading] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [works, setWorks] = useState<OrcidWork[]>([]);
    const [step, setStep] = useState<'search' | 'select'>('search');
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const toast = useToast();

    useEffect(() => {
        const fetchMembers = async () => {
            setLoadingMembers(true);
            const { data } = await supabase
                .from('membros')
                .select('id, nome, orientador, lattes_id')
                .order('nome', { ascending: true });
            setMembers(data || []);
            setLoadingMembers(false);
        };
        fetchMembers();
    }, []);

    const selectedMember = members.find(m => m.id === selectedMemberId);

    const fetchToken = async () => {
        const response = await fetch('https://orcid.org/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'client_credentials',
                scope: '/read-public'
            })
        });

        if (!response.ok) throw new Error('Falha ao autenticar na API do ORCID.');
        const data = await response.json();
        return data.access_token;
    };

    // Busca detalhes completos de um trabalho incluindo os contribuidores
    const fetchWorkDetails = async (token: string, orcidId: string, putCode: string): Promise<string> => {
        try {
            const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/work/${putCode}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            if (!response.ok) return '';
            const data = await response.json();
            const contributors = data?.contributors?.contributor || [];
            return contributors.map((c: any) => c['credit-name']?.value || '').join('; ');
        } catch {
            return '';
        }
    };

    const handleSearch = async () => {
        if (!orcid.trim()) {
            toast.error('Por favor, informe o ORCID iD.');
            return;
        }

        const cleanOrcid = orcid.replace(/[^0-9X-]/gi, '');
        if (cleanOrcid.length !== 19) {
            toast.error('Formato inválido. Use algo como 0000-0002-1825-0097');
            return;
        }

        const advisorName = selectedMember?.orientador || '';

        setLoading(true);
        try {
            const token = await fetchToken();

            const response = await fetch(`https://pub.orcid.org/v3.0/${cleanOrcid}/works`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error('Não foi possível buscar as publicações deste ORCID.');

            const data = await response.json();
            const groups = data.group || [];

            // Extrai informações básicas dos artigos
            const basicWorks = groups.map((group: any) => {
                const summary = group['work-summary'][0];
                const title = summary.title?.title?.value || 'Sem Título';
                const year = parseInt(summary['publication-date']?.year?.value) || new Date().getFullYear();
                const rawType = summary.type || 'UNKNOWN';
                const mappedType = typeMapping[rawType] || 'Outro';
                let url = '';
                const extIds = summary['external-ids']?.['external-id'];
                if (extIds && Array.isArray(extIds)) {
                    const doi = extIds.find((id: any) => id['external-id-type'] === 'doi');
                    if (doi) url = doi['external-id-url']?.value || `https://doi.org/${doi['external-id-value']}`;
                }
                return { putCode: summary['put-code'].toString(), title, year, url, type: mappedType };
            });

            if (basicWorks.length === 0) {
                toast.error('Nenhuma publicação encontrada para este ORCID.');
                return;
            }

            toast.success(`${basicWorks.length} publicações encontradas! Verificando autoria GSIPP...`);

            // Busca detalhes de todos os trabalhos em paralelo para identificar GSIPP
            const detailsPromises = basicWorks.map((w: any) =>
                fetchWorkDetails(token, cleanOrcid, w.putCode)
            );
            const allContributors = await Promise.all(detailsPromises);

            const fetchedWorks: OrcidWork[] = basicWorks.map((w: any, i: number) => {
                const contributorsStr = allContributors[i];
                const isGsipp = advisorName ? matchesAdvisor(advisorName, contributorsStr) : false;
                return {
                    id: w.putCode,
                    title: w.title,
                    year: w.year,
                    url: w.url,
                    type: w.type,
                    authors: contributorsStr || 'Revisar Autores',
                    selected: isGsipp, // Pré-seleciona apenas artigos do grupo
                    isGsipp
                };
            });

            // Ordena: GSIPP primeiro, depois os outros
            fetchedWorks.sort((a, b) => (b.isGsipp ? 1 : 0) - (a.isGsipp ? 1 : 0));

            setWorks(fetchedWorks);
            setStep('select');

            const gsippCount = fetchedWorks.filter(w => w.isGsipp).length;
            if (gsippCount > 0) {
                toast.success(`${gsippCount} artigos identificados como GSIPP ✓`);
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erro inesperado ao buscar ORCID.');
        } finally {
            setLoading(false);
        }
    };

    // Importa um artigo único via DOI usando a API Crossref
    const handleDoiSearch = async () => {
        if (!doi.trim()) { toast.error('Cole um DOI ou URL do DOI.'); return; }

        // Extrai só o identificador do DOI de uma URL completa
        const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, '').trim();

        setLoading(true);
        try {
            const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`, {
                headers: { 'User-Agent': 'GSIPP-Admin/1.0 (mailto:gsipp@ufc.br)' }
            });
            if (!res.ok) throw new Error('DOI não encontrado. Verifique se está correto.');
            const json = await res.json();
            const item = json.message;

            const title = item.title?.[0] || 'Sem Título';
            const year = item.published?.['date-parts']?.[0]?.[0] || new Date().getFullYear();
            const authors = (item.author || []).map((a: any) =>
                a.family ? `${a.family}, ${a.given || ''}`.trim() : a.name || ''
            ).join('; ');
            const rawType = (item.type || '').toUpperCase().replace(/-/g, '_');
            const type = typeMapping[rawType] || item.type || 'Artigo';
            const url = `https://doi.org/${cleanDoi}`;

            const advisorName = selectedMember?.orientador || '';
            const isGsipp = advisorName ? matchesAdvisor(advisorName, authors) : false;

            const newWork: OrcidWork = {
                id: cleanDoi, title, year, url, type, authors,
                selected: true, isGsipp
            };

            setWorks([newWork]);
            setStep('select');
            toast.success(isGsipp ? 'Artigo encontrado e identificado como GSIPP ✓' : 'Artigo encontrado!');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao buscar DOI.');
        } finally {
            setLoading(false);
        }
    };

    const handleUfcSearch = async () => {
        if (!ufcUrl || !ufcUrl.includes('repositorio.ufc.br')) {
            toast.error('Insira um link válido do Repositório da UFC (ex: http://repositorio.ufc.br/handle/riufc/...).');
            return;
        }
        setLoading(true);

        const proxies = [
            { url: (target: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`, parse: (res: Response) => res.text() },
            { url: (target: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(target)}&callback=?`, parse: async (res: Response) => {
                const text = await res.text();
                // AllOrigins com callback retorna algo como ?({"contents": "..."})
                const match = text.match(/\?\((.*)\)/);
                if (match) return JSON.parse(match[1]).contents;
                return JSON.parse(text).contents;
            }},
            { url: (target: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`, parse: (res: Response) => res.text() }
        ];

        let htmlText = '';
        let success = false;

        for (const proxy of proxies) {
            try {
                const response = await fetch(proxy.url(ufcUrl));
                if (response.ok) {
                    htmlText = await proxy.parse(response);
                    if (htmlText && !htmlText.includes('Error:')) {
                        success = true;
                        break;
                    }
                }
            } catch (err) {
                console.error('Proxy failed:', err);
                continue;
            }
        }

        if (!success) {
            setLoading(false);
            toast.error('Falha ao conectar com os serviços de proxy (CORS). Tente novamente em alguns segundos.');
            return;
        }

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const getMeta = (name: string) => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || null;
            const getAllMeta = (name: string) => Array.from(doc.querySelectorAll(`meta[name="${name}"]`)).map(m => m.getAttribute('content')).filter(Boolean) as string[];

            const formatUfcName = (name: string | null) => {
                if (!name) return '';
                if (name.includes(',')) {
                    const [surname, ...firstNames] = name.split(',').map(s => s.trim());
                    return `${firstNames.join(' ')} ${surname}`;
                }
                return name.trim();
            };

            const title = getMeta('citation_title') || getMeta('DC.title');
            const rawAuthors = getAllMeta('citation_author').length > 0 ? getAllMeta('citation_author') : getAllMeta('DC.creator');
            const date = getMeta('citation_date') || getMeta('DC.date.issued');

            const rawContributors = getAllMeta('DC.contributor');
            const advisor = formatUfcName(getMeta('DC.contributor.advisor') || rawContributors[0]);
            const coAdvisor = formatUfcName(getMeta('DC.contributor.advisor-co') || getMeta('DC.contributor.coadvisor') || rawContributors[1]);

            if (!title) throw new Error('Não foi possível extrair os metadados. Verifique se é uma página válida.');

            const authors = rawAuthors.map(formatUfcName);

            let year = new Date().getFullYear();
            if (date) {
                const parsedYear = parseInt(date.substring(0, 4));
                if (!isNaN(parsedYear)) year = parsedYear;
            }

            // Agora que temos campos separados, removemos o orientador e co-orientador da lista de autores
            // para evitar duplicidade visual nos cards.
            const filteredAuthorsList = authors.filter(a => a !== advisor && a !== coAdvisor);
            let formattedAuthors = filteredAuthorsList.length > 0 ? filteredAuthorsList.join('; ') : (authors[0] || 'Autor desconhecido');

            const newWork: OrcidWork = {
                id: ufcUrl, 
                title, 
                year, 
                url: ufcUrl, 
                type: 'TCC', 
                authors: formattedAuthors,
                orientador: advisor || '',
                co_orientador: coAdvisor || '',
                selected: true, 
                isGsipp: true
            };

            setWorks([newWork]);
            setStep('select');
            toast.success('Metadados da UFC extraídos com sucesso!');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao buscar dados da UFC.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        setWorks(works.map(w => w.id === id ? { ...w, selected: !w.selected } : w));
    };

    const handleImportSubmit = () => {
        const selectedWorks = works.filter(w => w.selected).map(w => ({
            titulo: w.title,
            ano: w.year,
            link_doi: w.url,
            tipo: w.type,
            autores: w.authors,
            orientador: w.orientador || '',
            co_orientador: w.co_orientador || ''
        }));

        if (selectedWorks.length === 0) {
            toast.error('Selecione pelo menos uma publicação para importar.');
            return;
        }

        onImport(selectedWorks);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-3xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-600" />
                        Importar Publicação
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                {step === 'search' && (
                    <div className="flex border-b border-slate-100 shrink-0">
                        <button
                            onClick={() => setImportMode('orcid')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                                importMode === 'orcid' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Por ORCID (vários artigos)
                        </button>
                        <button
                            onClick={() => setImportMode('doi')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                                importMode === 'doi' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Por DOI (artigo único)
                        </button>
                        <button
                            onClick={() => setImportMode('ufc')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
                                importMode === 'ufc' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Por Link (UFC)
                        </button>
                    </div>
                )}

                <div className="p-6 flex-grow overflow-y-auto">
                    {step === 'search' ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-5 max-w-md mx-auto">

                            {/* Member Selector — shared by both modes */}
                            <div className="w-full space-y-2">
                                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Membro (opcional, para identificar autoria GSIPP)
                                </label>
                                <select
                                    value={selectedMemberId}
                                    onChange={e => setSelectedMemberId(e.target.value)}
                                    disabled={loadingMembers}
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-800"
                                >
                                    <option value="">Sem filtro de orientador</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.nome}</option>
                                    ))}
                                </select>
                                {selectedMember?.orientador && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                        <span>Filtro ativo: <strong>{selectedMember.orientador}</strong></span>
                                    </div>
                                )}
                            </div>

                            {importMode === 'ufc' ? (
                                <>
                                    <div className="w-full space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">Link do Repositório UFC</label>
                                        <input
                                            type="url"
                                            value={ufcUrl}
                                            onChange={(e) => setUfcUrl(e.target.value)}
                                            placeholder="Ex: http://repositorio.ufc.br/handle/riufc/79665"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-800"
                                            onKeyDown={(e) => e.key === 'Enter' && handleUfcSearch()}
                                        />
                                        <p className="text-xs text-slate-400">Cole o link completo do trabalho (TCC, Dissertação, etc).</p>
                                    </div>
                                    <button
                                        onClick={handleUfcSearch}
                                        disabled={loading || !ufcUrl.trim()}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                        {loading ? 'Buscando...' : 'Buscar Repositório UFC'}
                                    </button>
                                </>
                            ) : importMode === 'orcid' ? (
                                <>
                                    <div className="w-full space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">ORCID iD</label>
                                        <input
                                            type="text"
                                            value={orcid}
                                            onChange={(e) => setOrcid(e.target.value)}
                                            placeholder="Ex: 0000-0002-1825-0097"
                                            className="w-full pl-4 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-center text-lg font-medium tracking-wide text-slate-800"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading || !orcid.trim()}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                        {loading ? 'Buscando e verificando autoria...' : 'Pesquisar Publicações'}
                                    </button>
                                    {loading && <p className="text-xs text-slate-500 text-center">Verificando autoria de cada artigo, isso pode levar alguns segundos...</p>}
                                </>
                            ) : (
                                <>
                                    <div className="w-full space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">DOI ou URL do DOI</label>
                                        <input
                                            type="text"
                                            value={doi}
                                            onChange={(e) => setDoi(e.target.value)}
                                            placeholder="Ex: https://doi.org/10.5753/webmedia.2025.16143"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all text-slate-800"
                                            onKeyDown={(e) => e.key === 'Enter' && handleDoiSearch()}
                                        />
                                        <p className="text-xs text-slate-400">Aceita URL completa ou apenas o identificador (ex: 10.5753/...)</p>
                                    </div>
                                    <button
                                        onClick={handleDoiSearch}
                                        disabled={loading || !doi.trim()}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                        {loading ? 'Buscando...' : 'Buscar pelo DOI'}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    <span className="font-bold text-slate-900">{works.length}</span> publicações encontradas.
                                    {works.some(w => w.isGsipp) && (
                                        <span className="ml-2 text-emerald-700 font-medium">
                                            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                                            {works.filter(w => w.isGsipp).length} identificadas como GSIPP
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2 text-xs">
                                    <button onClick={() => setWorks(works.map(w => ({ ...w, selected: true })))} className="text-blue-600 hover:underline">Todos</button>
                                    <span className="text-slate-300">|</span>
                                    <button onClick={() => setWorks(works.map(w => ({ ...w, selected: false })))} className="text-slate-500 hover:underline">Nenhum</button>
                                    <span className="text-slate-300">|</span>
                                    <button onClick={() => setWorks(works.map(w => ({ ...w, selected: w.isGsipp })))} className="text-emerald-600 hover:underline">Só GSIPP</button>
                                </div>
                            </div>

                            {/* Legend */}
                            {works.some(w => w.isGsipp) && (
                                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs border border-emerald-100 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 shrink-0" />
                                    <span>Artigos com badge <strong>GSIPP ✓</strong> foram identificados com o orientador nos autores e já estão pré-selecionados.</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                {works.map(work => (
                                    <div
                                        key={work.id}
                                        onClick={() => toggleSelection(work.id)}
                                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${work.selected ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="pt-0.5 shrink-0">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${work.selected ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'}`}>
                                                {work.selected && <Check className="w-3.5 h-3.5" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-2 flex-wrap">
                                                <h5 className="font-semibold text-slate-900 leading-snug text-sm">{work.title}</h5>
                                                {work.isGsipp && (
                                                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                                                        <ShieldCheck className="w-3 h-3" /> GSIPP ✓
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600">{work.year}</span>
                                                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-500">{work.type}</span>
                                                {work.url && <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-600">DOI disponível</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {step === 'select' && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
                        <button onClick={() => setStep('search')} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm">← Voltar</button>
                        <button
                            onClick={handleImportSubmit}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-sm"
                        >
                            <Database className="w-4 h-4" /> Importar Selecionadas ({works.filter(w => w.selected).length})
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default OrcidImporter;
