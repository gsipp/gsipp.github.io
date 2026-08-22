// Cloudflare Worker: fetch-ufc-metadata
// Deploy: https://workers.cloudflare.com
// Cole este código no editor do Cloudflare Workers (workers.dev)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers: CORS_HEADERS });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Body inválido' }), { status: 400, headers: CORS_HEADERS });
    }

    const { url } = body;
    if (!url || !url.includes('repositorio.ufc.br')) {
      return new Response(JSON.stringify({ error: 'URL inválida' }), { status: 400, headers: CORS_HEADERS });
    }

    const secureUrl = url.replace('http://', 'https://');

    let html;
    try {
      const res = await fetch(secureUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        cf: { cacheTtl: 300, cacheEverything: false },
      });

      if (!res.ok) {
        return new Response(JSON.stringify({ error: `UFC respondeu ${res.status}` }), { status: 502, headers: CORS_HEADERS });
      }
      html = await res.text();
    } catch (e) {
      return new Response(JSON.stringify({ error: `Erro ao buscar UFC: ${e.message}` }), { status: 502, headers: CORS_HEADERS });
    }

    const getMeta = (name) => {
      const m = html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]+)"`, 'i'))
               || html.match(new RegExp(`<meta\\s+content="([^"]+)"\\s+name="${name}"`, 'i'));
      return m ? m[1] : null;
    };

    const getAllMeta = (name) => {
      const regex = new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]+)"`, 'gi');
      const results = [];
      let m;
      while ((m = regex.exec(html)) !== null) results.push(m[1]);
      return results;
    };

    const formatName = (name) => {
      if (!name) return '';
      if (name.includes(',')) {
        const [sobrenome, ...primeiros] = name.split(',').map(s => s.trim());
        return `${primeiros.join(' ')} ${sobrenome}`.trim();
      }
      return name.trim();
    };

    const title = getMeta('citation_title') || getMeta('DC.title');
    if (!title) {
      return new Response(JSON.stringify({ error: 'Metadados não encontrados. Verifique o link.' }), { status: 422, headers: CORS_HEADERS });
    }

    const rawAuthors = getAllMeta('citation_author').length > 0 ? getAllMeta('citation_author') : getAllMeta('DC.creator');
    const date = getMeta('citation_date') || getMeta('DC.date.issued');
    const pdfUrl = getMeta('citation_pdf_url');
    const type = getMeta('DC.type') || 'TCC';

    const dcContributors = getAllMeta('DC.contributor');
    const advisor = formatName(getMeta('DC.contributor.advisor') || dcContributors[0] || null);
    const coAdvisor = formatName(getMeta('DC.contributor.advisor-co') || getMeta('DC.contributor.coadvisor') || dcContributors[1] || null);

    const authors = rawAuthors.map(formatName).filter(a => a && a !== advisor && a !== coAdvisor);

    let year = new Date().getFullYear();
    if (date) {
      const parsedYear = parseInt(date.substring(0, 4));
      if (!isNaN(parsedYear)) year = parsedYear;
    }

    return new Response(JSON.stringify({
      titulo: title,
      autores: authors.length > 0 ? authors.join('; ') : rawAuthors.map(formatName).join('; '),
      ano: year,
      tipo: type,
      orientador: advisor || null,
      co_orientador: coAdvisor || null,
      link_pdf: pdfUrl ? pdfUrl.replace('http://', 'https://') : null,
      link_doi: secureUrl,
    }), { status: 200, headers: CORS_HEADERS });
  }
};
