async function loadNewsArticle() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const index = parseInt(urlParams.get('index')) || 0;
        const response = await fetch('data/noticias.json');
        const data = await response.json();
        const noticia = data.noticias[index];

        if (noticia) {
            document.getElementById('news-title').textContent = noticia.title;
            document.getElementById('news-image').src = noticia.image;
            document.getElementById('news-image').alt = noticia.title;
            document.getElementById('news-date').textContent = `Data: ${noticia.date}`;
            document.getElementById('news-description').textContent = noticia.description;

            const fullTextContainer = document.getElementById('news-full-text');
            fullTextContainer.innerHTML = '';
            if (Array.isArray(noticia.fullText)) {
                noticia.fullText.forEach(paragraph => {
                    const p = document.createElement('p');
                    p.textContent = paragraph;
                    fullTextContainer.appendChild(p);
                });
            } else {
                const p = document.createElement('p');
                p.textContent = noticia.fullText;
                fullTextContainer.appendChild(p);
            }
        } else {
            document.getElementById('news-title').textContent = 'Notícia não encontrada';
            document.getElementById('news-full-text').textContent = 'A notícia solicitada não está disponível.';
        }
    } catch (error) {
        console.error('Erro ao carregar notícia:', error);
        document.getElementById('news-title').textContent = 'Erro ao carregar';
        document.getElementById('news-full-text').textContent = 'Ocorreu um erro ao carregar a notícia. Tente novamente mais tarde.';
    }
}

document.addEventListener('DOMContentLoaded', loadNewsArticle);