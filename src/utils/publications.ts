export const TYPE_TRANSLATIONS: Record<string, string> = {
    'proceedings-article': 'Artigo em Conferência',
    'journal-article': 'Artigo em Periódico',
    'book-chapter': 'Capítulo de Livro',
    'book': 'Livro',
    'PROCEEDINGS_ARTICLE': 'Artigo em Conferência',
    'JOURNAL_ARTICLE': 'Artigo em Periódico',
};

export const formatTipo = (tipo: string) => TYPE_TRANSLATIONS[tipo] || tipo;

export const TYPE_COLORS: Record<string, { badge: string; icon: string }> = {
    'Artigo em Periódico':   { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'text-blue-500' },
    'Artigo em Conferência': { badge: 'bg-violet-50 text-violet-700 border-violet-200', icon: 'text-violet-500' },
    'Artigo':                { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'text-blue-500' },
    'Tese':                  { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'text-amber-500' },
    'Dissertação':           { badge: 'bg-orange-50 text-orange-700 border-orange-200', icon: 'text-orange-500' },
    'Livro':                 { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'text-emerald-500' },
    'Capítulo de Livro':     { badge: 'bg-teal-50 text-teal-700 border-teal-200', icon: 'text-teal-500' },
    'Preprint':              { badge: 'bg-pink-50 text-pink-700 border-pink-200', icon: 'text-pink-500' },
    'TCC':                   { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'text-emerald-500' },
};

export const getTypeStyle = (tipo: string) => {
    const translated = formatTipo(tipo);
    return TYPE_COLORS[translated] || { badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'text-slate-500' };
};

export const checkIsMember = (authorName: string, members: string[]) => {
    const authorStr = authorName.toLowerCase().trim();
    if (!authorStr) return false;
    
    return members.some(m => {
        const memStr = m.toLowerCase().trim();
        if (memStr === authorStr) return true;
        if (memStr.includes(authorStr) || authorStr.includes(memStr)) return true;
        
        const memParts = memStr.split(' ').filter(p => p.length > 2);
        const lastName = memParts[memParts.length - 1];
        if (lastName && authorStr.includes(lastName)) {
            const firstName = memParts[0];
            if (firstName && authorStr.includes(firstName)) return true;
            const initial = memStr.charAt(0) + '.';
            if (authorStr.includes(initial)) return true;
        }
        
        return false;
    });
};

export const getExternalLinkText = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('tcc') || t.includes('tese') || t.includes('dissertação')) return "Acessar Repositório";
    return "Acessar DOI Oficial";
};

export const getExternalButtonLabel = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('tcc') || t.includes('tese') || t.includes('dissertação')) return "Link";
    return "DOI";
};

export const getPdfText = (tipo: string) => {
    const t = tipo?.toLowerCase() || '';
    if (t.includes('tcc')) return "Visualizar TCC";
    if (t.includes('tese')) return "Visualizar Tese";
    if (t.includes('dissertação')) return "Visualizar Dissertação";
    return "Baixar PDF";
};

export const formatAuthorName = (authorStr: string) => {
    if (authorStr.includes(',')) {
        const parts = authorStr.split(',');
        if (parts.length === 2) {
            const lastName = parts[0].trim();
            const firstName = parts[1].trim();
            return `${firstName} ${lastName}`;
        }
    }
    return authorStr;
};
