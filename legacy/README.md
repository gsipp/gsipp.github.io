# GSIPP - Grupo de Pesquisa em Segurança da Informação e Preservação da Privacidade

Este repositório contém o código-fonte atual do website do **GSIPP**, sediado no campus de Crateús da Universidade Federal do Ceará (UFC). O site serve como portal institucional para divulgar as linhas de pesquisa, membros, publicações, eventos e notícias do grupo.

## 📦 Estrutura do Projeto (Legado)

O projeto atual é um site estático construído com tecnologias web fundamentais:

*   **HTML5**: Estruturação semântica do conteúdo.
*   **CSS / Tailwind**: Estilização baseada em **Tailwind CSS (via CDN)** e estilos personalizados em `css/styles.css`.
*   **JavaScript (Vanilla)**: Lógica de apresentação, paginação e carregamento de dados em `js/index.js` e `js/noticia.js`.
*   **Dados**:
    *   `data/noticias.json`: Base de dados simples para notícias.
    *   *Hardcoded*: Dados de membros e TCCs estão inseridos diretamente no código JavaScript.

### Organização de Arquivos
```
.
├── css/             # Estilos personalizados
├── data/            # Arquivos de dados JSON
├── img/             # Imagens e assets
├── js/              # Scripts da aplicação
├── index.html       # Página principal (Single Page Layout)
└── noticia.html     # Página de detalhes da notícia
```

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework CSS**: Tailwind CSS (CDN)
- **Bibliotecas**: FontAwesome (Ícones), XLSX (Processamento de planilhas - legado)

## 🔮 Futuro do Projeto (Revamp)

Estamos iniciando um processo de **reformulação completa** do site, com os seguintes objetivos:

1.  **Novo Visual**: Redesign completo da interface de usuário.
2.  **Upgrade Tecnológico**: Adoção do **Tailwind CSS 4.1** para estilização moderna e performática.
3.  **Backend & Banco de Dados**: Integração com **Supabase** para gerenciamento dinâmico de conteúdo (Membros, Notícias, Eventos), eliminando a dependência de arquivos JSON estáticos e edições manuais de código.

---
*Gerado automaticamente como parte do planejamento de migração.*
