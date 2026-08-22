import { useState, useEffect } from 'react';
import { Search, Loader2, X, Check, Database, User, ShieldCheck, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

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

export default function ImportPublications() {
    const navigate = useNavigate();
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

        try {
            // Chama a Edge Function do Supabase (server-side, sem CORS)
            const { data, error } = await supabase.functions.invoke('fetch-ufc-metadata', {
                body: { url: ufcUrl },
            });

            if (error) throw new Error(error.message);
            if (data.error) throw new Error(data.error);

            const newWork: OrcidWork = {
                id: ufcUrl,
                title: data.titulo,
                year: data.ano,
                url: data.link_doi,
                type: data.tipo || 'TCC',
                authors: data.autores,
                orientador: data.orientador || '',
                co_orientador: data.co_orientador || '',
                selected: true,
                isGsipp: true,
            };

            setWorks([newWork]);
            setStep('select');
            toast.success('Metadados da UFC extraídos com sucesso!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao buscar dados da UFC.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        setWorks(works.map(w => w.id === id ? { ...w, selected: !w.selected } : w));
    };

    const handleImportSubmit = async () => {
        const toImport = works.filter(w => w.selected).map(w => ({
            titulo: w.title,
            ano: w.year,
            autores: w.authors,
            link_doi: w.type !== 'Repositório Institucional' ? w.url : '',
            link_pdf: w.type === 'Repositório Institucional' ? w.url : '',
            tipo: typeMapping[w.type] || 'Artigo',
            veiculo: '',
            orientador: w.orientador || null,
            co_orientador: w.co_orientador || null
        }));

        if (toImport.length === 0) {
            toast.error('Selecione pelo menos uma publicação para importar.');
            return;
        }
        
        setLoading(true);
        const { error } = await supabase.from('publicacoes').insert(toImport);
        setLoading(false);

        if (error) {
            toast.error('Erro ao salvar publicações importadas: ' + (error as Error).message);
        } else {
            toast.success(`${toImport.length} publicações importadas com sucesso!`);
            navigate('/gestao-gsipp/publicacoes');
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/gestao-gsipp/publicacoes')} className="p-2 hover:bg-slate-200 rounded-md transition-colors text-slate-500">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Importar Publicação</h1>
                        <p className="text-sm text-slate-500 mt-1">Busque artigos por ORCID, DOI ou link do Repositório UFC.</p>
                    </div>
                </div>
            </header>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col min-h-[500px]">

                {/* Tabs */}
                {step === 'search' && (
                    <div className="flex border-b border-slate-100 shrink-0">
                        <button
                            onClick={() => setImportMode('orcid')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                                importMode === 'orcid' ? 'border-slate-800 text-slate-900 bg-slate-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            Por ORCID (vários artigos)
                        </button>
                        <button
                            onClick={() => setImportMode('doi')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                                importMode === 'doi' ? 'border-slate-800 text-slate-900 bg-slate-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            Por DOI (artigo único)
                        </button>
                        <button
                            onClick={() => setImportMode('ufc')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                                importMode === 'ufc' ? 'border-slate-800 text-slate-900 bg-slate-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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
                                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4" /> Membro (opcional, para identificar autoria GSIPP)
                                </label>
                                <select
                                    value={selectedMemberId}
                                    onChange={e => setSelectedMemberId(e.target.value)}
                                    disabled={loadingMembers}
                                    className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm bg-white"
                                >
                                    <option value="">Sem filtro de orientador</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.nome}</option>
                                    ))}
                                </select>
                                {selectedMember?.orientador && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 mt-2">
                                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                        <span>Filtro ativo: <strong>{selectedMember.orientador}</strong></span>
                                    </div>
                                )}
                            </div>

                            {importMode === 'ufc' ? (
                                <>
                                    <div className="w-full space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Link do Repositório UFC</label>
                                        <input
                                            type="url"
                                            value={ufcUrl}
                                            onChange={(e) => setUfcUrl(e.target.value)}
                                            placeholder="Ex: http://repositorio.ufc.br/handle/riufc/79665"
                                            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleUfcSearch()}
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Cole o link completo do trabalho (TCC, Dissertação, etc).</p>
                                    </div>
                                    <button
                                        onClick={handleUfcSearch}
                                        disabled={loading || !ufcUrl.trim()}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        {loading ? 'Buscando...' : 'Buscar Repositório UFC'}
                                    </button>
                                </>
                            ) : importMode === 'orcid' ? (
                                <>
                                    <div className="w-full space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">ORCID iD</label>
                                        <input
                                            type="text"
                                            value={orcid}
                                            onChange={(e) => setOrcid(e.target.value)}
                                            placeholder="Ex: 0000-0002-1825-0097"
                                            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm text-center font-medium tracking-wide"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={loading || !orcid.trim()}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        {loading ? 'Buscando...' : 'Pesquisar Publicações'}
                                    </button>
                                    {loading && <p className="text-xs text-slate-500 text-center">Verificando autoria de cada artigo, isso pode levar alguns segundos...</p>}
                                </>
                            ) : (
                                <>
                                    <div className="w-full space-y-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">DOI ou URL do DOI</label>
                                        <input
                                            type="text"
                                            value={doi}
                                            onChange={(e) => setDoi(e.target.value)}
                                            placeholder="Ex: https://doi.org/10.5753/webmedia.2025.16143"
                                            className="w-full px-3 py-2 rounded-md border border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all text-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleDoiSearch()}
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Aceita URL completa ou apenas o identificador (ex: 10.5753/...)</p>
                                    </div>
                                    <button
                                        onClick={handleDoiSearch}
                                        disabled={loading || !doi.trim()}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
                                        <span className="ml-2 text-slate-700 font-medium">
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
                                    <button onClick={() => setWorks(works.map(w => ({ ...w, selected: w.isGsipp })))} className="text-slate-600 hover:underline">Só GSIPP</button>
                                </div>
                            </div>

                            {/* Legend */}
                            {works.some(w => w.isGsipp) && (
                                <div className="bg-slate-50 text-slate-600 p-3 rounded-md text-xs border border-slate-200 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 shrink-0" />
                                    <span>Artigos com badge <strong>GSIPP ✓</strong> foram identificados com o orientador nos autores e já estão pré-selecionados.</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                {works.map(work => (
                                    <div
                                        key={work.id}
                                        onClick={() => toggleSelection(work.id)}
                                        className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${work.selected ? 'border-slate-800 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <div className="pt-0.5 shrink-0">
                                            <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${work.selected ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-300'}`}>
                                                {work.selected && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-2 flex-wrap">
                                                <h5 className="font-medium text-slate-900 leading-snug text-sm">{work.title}</h5>
                                                {work.isGsipp && (
                                                    <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200">
                                                        <ShieldCheck className="w-3 h-3" /> GSIPP ✓
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-medium text-slate-600">{work.year}</span>
                                                <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-500">{work.type}</span>
                                                {work.url && <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-600">DOI</span>}
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
                        <button onClick={() => setStep('search')} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-md transition-colors text-sm">← Voltar</button>
                        <button
                            onClick={handleImportSubmit}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Database className="w-4 h-4" /> Importar Selecionadas ({works.filter(w => w.selected).length})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
