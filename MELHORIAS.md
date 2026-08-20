# 🚀 Plano de Melhorias Técnicas e UX/UI - GSIPP

Este documento lista oportunidades de melhorias identificadas no projeto, divididas por categorias de impacto técnico, experiência do usuário (UX), desempenho e segurança.

## 1. 🛠 Infraestrutura, Build e Dependências

- [x] **Resolução de Conflitos do NPM**: O comando `npm install` está falhando devido a um conflito de dependência com a versão do TypeScript (`~7.0.2` instalada vs `<6.1.0` requerida pelo `@typescript-eslint`).
  - **Ação**: Fazer o downgrade do TypeScript para a versão mais estável suportada pelo ESLint (ex: `~5.7.2`) ou resolver atualizando os plugins de Lint.
- [x] **Implementação de Testes Automatizados**: Atualmente o projeto não possui testes.
  - **Ação**: Configurar **Vitest** + **React Testing Library** para criar testes unitários (especialmente funções em `src/utils/`) e testes de integração de componentes chave.

## 2. 🏗 Arquitetura e Roteamento (`App.tsx`)

- [x] **Code Splitting / Lazy Loading**: Todo o painel administrativo (rotas `/gestao-gsipp`) está sendo carregado junto com a página pública inicial. Isso prejudica o tamanho do bundle e a velocidade de carregamento da Home.
  - **Ação**: Implementar `React.lazy` e `<Suspense>` para carregar os componentes de administração sob demanda, separando a aplicação em chunks (blocos).
- [x] **Extração da Página 404**: O código da página 404 ("Página não encontrada") está injetado diretamente no arquivo `App.tsx`.
  - **Ação**: Criar uma página dedicada `NotFound.tsx` na pasta `pages/` para melhorar a legibilidade do código de rotas.
- [x] **Tratamento Global de Erros (Error Boundaries)**: Se um componente falhar silenciosamente (ex: dado do Supabase ausente), a tela inteira pode ficar em branco.
  - **Ação**: Criar um componente `<ErrorBoundary>` no React para capturar exceções e mostrar uma UI amigável caso algo quebre na interface.

## 3. 🛡️ Formulários, Segurança e Clean Code

- **Gerenciamento Avançado de Formulários**: O painel administrativo (como no `Login.tsx`) gerencia estados usando múltiplos `useState`. Isso tende a não escalar bem em formulários complexos como cadastro de editais ou perfis completos.
  - **Ação**: Adotar as bibliotecas **React Hook Form** + **Zod** para padronização, tipagem e validação robusta de esquemas, reduzindo os re-renders e garantindo dados limpos antes de enviar ao Supabase.
- **Centralização de Constantes**: Existem caminhos "hardcoded" (ex: strings puras como `/gestao-gsipp` no roteamento e nos links).
  - **Ação**: Criar um arquivo `src/utils/constants.ts` (ou `routes.ts`) contendo variáveis exportadas. Caso a URL do painel administrativo precise mudar por segurança, altera-se apenas em um lugar.

## 4. ⚡ Performance e Acessibilidade (A11y)

- **Otimização de Imagens Externas**: Algumas imagens carregam fontes externas (como a imagem do Lattes via Servlet do CNPq). Requisições HTTP não otimizadas podem penalizar o tempo de carregamento da tela de membros e home.
  - **Ação**: Avaliar um proxy simples via Edge Functions do Supabase ou um tratamento de cache das imagens, evitando o recarregamento excessivo sempre que a página for visitada.
- **Auditoria de Acessibilidade (A11y)**: Melhorar a acessibilidade visual e de leitores de tela.
  - **Ação**: Certificar de que todos os modais e menus possam ser fechados teclando `ESC` e navegados via `Tab`. Validar contrastes de cores de texto nas áreas de fundo escuro (`bg-slate-900`) na home.
- **Refinamento de SEO**: O `react-helmet-async` já está configurado, mas pode ser otimizado.
  - **Ação**: Adicionar tags específicas (Open Graph / Twitter Cards) dinâmicas e marcação de Schema estruturado (JSON-LD) para otimizar os resultados das postagens de notícias no Google.

---
**Próximos Passos:** 
Caso queira seguir com a implementação destas melhorias, basta indicar a prioridade ou dizer _"Vamos corrigir os erros do npm e o roteamento primeiro!"_.
