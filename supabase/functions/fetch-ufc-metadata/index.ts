// Supabase Edge Function: fetch-ufc-metadata
// Busca os metadados de um item do Repositório Institucional da UFC
// e retorna como JSON, contornando o CORS do browser.

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { url } = await req.json();

    if (!url || !url.includes('repositorio.ufc.br')) {
      return new Response(
        JSON.stringify({ error: 'URL inválida. Deve ser do repositório da UFC.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const secureUrl = url.replace('http://', 'https://');
    const httpUrl = url.replace('https://', 'http://');

    // Tenta buscar com timeout de 15s, tentando https e http
    const tryFetch = async (targetUrl: string) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(targetUrl, {
          signal: controller.signal,
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
          },
        });
        return res;
      } finally {
        clearTimeout(timer);
      }
    };

    let response: Response | null = null;
    let lastError = '';

    for (const targetUrl of [secureUrl, httpUrl]) {
      try {
        response = await tryFetch(targetUrl);
        if (response.ok) break;
        lastError = `Status ${response.status} em ${targetUrl}`;
        response = null;
      } catch (e: unknown) {
        lastError = e instanceof Error ? e.message : String(e);
        response = null;
      }
    }

    if (!response || !response.ok) {
      return new Response(
        JSON.stringify({ error: `Não foi possível acessar o repositório da UFC. ${lastError}` }),
        { status: 502, headers: corsHeaders }
      );
    }


    const html = await response.text();

    // Extrai meta tags com regex (Deno não tem DOMParser)
    const getMeta = (name: string): string | null => {
      const match = html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]+)"`, 'i'))
                 || html.match(new RegExp(`<meta\\s+content="([^"]+)"\\s+name="${name}"`, 'i'));
      return match ? match[1] : null;
    };

    const getAllMeta = (name: string): string[] => {
      const regex = new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]+)"`, 'gi');
      const results: string[] = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        results.push(match[1]);
      }
      return results;
    };

    // Helper para converter "Sobrenome, Nome" → "Nome Sobrenome"
    const formatName = (name: string | null): string => {
      if (!name) return '';
      if (name.includes(',')) {
        const [sobrenome, ...primeiros] = name.split(',').map(s => s.trim());
        return `${primeiros.join(' ')} ${sobrenome}`.trim();
      }
      return name.trim();
    };

    const title = getMeta('citation_title') || getMeta('DC.title');
    const rawAuthors = getAllMeta('citation_author').length > 0
      ? getAllMeta('citation_author')
      : getAllMeta('DC.creator');
    const date = getMeta('citation_date') || getMeta('DC.date.issued') || getMeta('DC.date');
    const pdfUrl = getMeta('citation_pdf_url');
    const type = getMeta('DC.type') || 'TCC';
    const description = getMeta('DC.description');

    // Orientador / co-orientador
    const dcContributors = getAllMeta('DC.contributor');
    const advisor = formatName(getMeta('DC.contributor.advisor') || dcContributors[0] || null);
    const coAdvisor = formatName(getMeta('DC.contributor.advisor-co') || getMeta('DC.contributor.coadvisor') || dcContributors[1] || null);

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Não foi possível extrair metadados. Verifique se o link é uma página válida do repositório.' }),
        { status: 422, headers: corsHeaders }
      );
    }

    const authors = rawAuthors
      .map(formatName)
      .filter(a => a && a !== advisor && a !== coAdvisor);

    let year = new Date().getFullYear();
    if (date) {
      const parsedYear = parseInt(date.substring(0, 4));
      if (!isNaN(parsedYear)) year = parsedYear;
    }

    return new Response(
      JSON.stringify({
        titulo: title,
        autores: authors.length > 0 ? authors.join('; ') : rawAuthors.map(formatName).join('; '),
        ano: year,
        tipo: type,
        orientador: advisor || null,
        co_orientador: coAdvisor || null,
        link_pdf: pdfUrl ? pdfUrl.replace('http://', 'https://') : null,
        link_doi: secureUrl,
        descricao: description || null,
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
