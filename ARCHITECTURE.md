# Arquitetura e Documentação Técnica - GSIPP

Este documento descreve a arquitetura técnica, as decisões de design, a estrutura do banco de dados e os principais fluxos do projeto GSIPP.

---

## 1. Visão Geral da Arquitetura

O sistema adota uma arquitetura **Serverless** / **Backend-as-a-Service (BaaS)**, utilizando o Supabase como motor principal para banco de dados, autenticação e armazenamento de arquivos. O frontend é uma Single Page Application (SPA) renderizada no lado do cliente.

* **Frontend:** React 18, construído com Vite e TypeScript.
* **Estilização:** Tailwind CSS (v4) com utilitários flexíveis e design responsivo.
* **Backend:** Supabase (PostgreSQL, Auth e Storage).
* **Hospedagem:** Configurado para ambientes como Github Pages, Vercel ou Netlify.

---

## 2. Padrões de Projeto e Decisões

### 2.1 Code Splitting e Lazy Loading
O sistema é dividido em duas áreas principais: o **Site Público** e o **Painel Administrativo** (\`/gestao-gsipp\`).
Para garantir que os visitantes do site público não precisem baixar o código pesado do painel de administração (bibliotecas de formulários avançados, validações, etc.), o React Router utiliza o \`React.lazy()\` para carregar sob demanda (*lazy load*) toda a rota do administrador.

### 2.2 Tratamento Global de Erros (Error Boundaries)
Para evitar a "Tela Branca da Morte" (White Screen of Death) típica do React quando ocorre um erro de renderização, o projeto implementa \`Error Boundaries\` que isolam as falhas e mostram mensagens amigáveis de recuperação, permitindo recarregar o sistema com segurança.

### 2.3 Contextos (Context API)
* **AuthContext:** Gerencia o estado global de autenticação do usuário, persistindo a sessão e roteando requisições não autorizadas para a tela de Login.
* **ToastContext:** Fornece um sistema global e leve para exibir mensagens de sucesso/erro (*toasts*) no canto superior direito.

---

## 3. Modelo de Dados (Supabase / PostgreSQL)

Abaixo estão as tabelas principais que compõem o banco de dados do sistema, protegidas por **Row Level Security (RLS)**.

### Tabela: \`membros\`
Armazena a equipe, pesquisadores e professores.
- \`id\` (uuid, PK): Identificador único.
- \`nome\` (text): Nome completo.
- \`cargo\` (text): Papel no grupo (Ex: Coordenador, Pesquisador, Aluno).
- \`email\` (text, null): Contato.
- \`lattes_url\` (text, null): Link do currículo Lattes.
- \`linkedin_url\` (text, null): Link do LinkedIn.
- \`researchgate_url\` (text, null): Link do ResearchGate.
- \`foto_url\` (text, null): URL da foto armazenada no Storage.
- \`foto_posicao\` (text): Controle de ajuste CSS (ex: \`center center\`).
- \`ordem\` (integer): Define a hierarquia visual de exibição.
- \`data_entrada\` (date): Data de ingresso no grupo.
- \`data_saida\` (date, null): Data de saída (se houver).
- \`created_at\` (timestamp).

### Tabela: \`publicacoes\`
Repositório de artigos, resumos e livros.
- \`id\` (uuid, PK)
- \`titulo\` (text)
- \`autores\` (text): Lista de autores separados por vírgula.
- \`veiculo\` (text): Nome da revista, conferência ou evento.
- \`ano\` (integer): Ano da publicação.
- \`tipo\` (text): Ex: \`Artigo\`, \`Resumo\`, \`Livro\`.
- \`pdf_url\` (text, null): URL do arquivo no Storage.
- \`link\` (text, null): DOI ou URL externo.
- \`created_at\` (timestamp)

### Tabela: \`noticias\`
Feed de novidades e acontecimentos.
- \`id\` (uuid, PK)
- \`titulo\` (text)
- \`resumo\` (text): Texto curto para os cards.
- \`conteudo\` (text): Texto longo com a notícia completa (aceita quebras de linha).
- \`imagem_url\` (text, null): Capa da notícia.
- \`data_publicacao\` (date)
- \`link_externo\` (text, null): Botão opcional "Ler Mais" externo.
- \`created_at\` (timestamp)

### Tabela: \`eventos\`
Agenda e calendário do grupo.
- \`id\` (uuid, PK)
- \`titulo\` (text)
- \`descricao\` (text)
- \`data_inicio\` (timestamp): Data e hora.
- \`data_fim\` (timestamp, null): Data e hora do término.
- \`local\` (text): Endereço físico ou link do Google Meet/Teams.
- \`imagem_url\` (text, null)
- \`link_inscricao\` (text, null)
- \`created_at\` (timestamp)

### Tabela: \`editais\`
Publicação de seleções, vagas e bolsas.
- \`id\` (uuid, PK)
- \`titulo\` (text)
- \`numero\` (text): Número do edital (Ex: 01/2026).
- \`descricao\` (text)
- \`data_publicacao\` (date)
- \`data_encerramento\` (date, null): Prazo final.
- \`status\` (text): \`Aberto\`, \`Em Andamento\` ou \`Finalizado\`.
- \`pdf_url\` (text, null): Arquivo principal do edital.
- \`created_at\` (timestamp)

### Tabela: \`declaracoes\`
Registro histórico antifraude das declarações geradas.
- \`id\` (uuid, PK)
- \`membro_id\` (uuid, FK -> membros.id, null): Relação caso o membro ainda exista.
- \`membro_nome\` (text): Backup do nome, caso o membro seja apagado.
- \`membro_cpf\` (text): Documento (CPF) extraído no momento da geração.
- \`codigo\` (text, UNIQUE): Hash de 8 caracteres alfanuméricos (ex: A1B2-C3D4).
- \`data_emissao\` (timestamp): Registro imutável de quando o PDF foi gerado.

### Tabela: \`configuracoes\`
Configurações dinâmicas injetadas no portal e PDFs.
- \`id\` (uuid, PK)
- \`chave\` (text, UNIQUE): Chave de busca (Ex: \`coordenador_nome\`).
- \`valor\` (text): O valor correspondente (Ex: \`Dr. Carlos Eduardo\`).
- \`descricao\` (text, null): Contexto explicativo.
- \`updated_at\` (timestamp)

---

## 4. Fluxo de Geração e Autenticidade de Declarações

A arquitetura implementa um sistema inovador de validação de documentos, resolvendo a necessidade de assinaturas físicas:
1. **Geração:** O administrador seleciona um Membro e preenche dados vitais (Data de emissão, CPF, Customização de texto).
2. **Registro:** Um código único (aleatório, uppercase, 8 dígitos) é gerado pelo frontend e gravado na tabela \`declaracoes\` do Supabase, amarrado ao nome/CPF do membro e à data atual.
3. **Impressão:** O layout HTML renderiza os dados formatados (ocultando a interface do admin via regras de media query \`@media print\`) e sugere o salvamento em PDF. O rodapé do PDF contém as instruções e o Código de Verificação.
4. **Validação Pública:** Qualquer visitante pode acessar a rota \`/validar\` e digitar o código. O sistema faz uma query pública na tabela de \`declaracoes\`. Se o código bater, um selo verde "Declaração Válida" é exibido com os metadados (para quem foi emitida e quando).

---

## 5. Storage / Arquivos

Todos os arquivos (Fotos de membros, Capas de Notícias, PDFs de Publicações e Editais) são enviados para *Buckets* (Pastas Virtuais) no **Supabase Storage**.
O frontend utiliza a API nativa do cliente do Supabase para fazer upload e resgatar as URLs públicas desses arquivos de forma transparente.

---

## 6. Segurança e Qualidade de Código

Para checagem rápida de sanidade do sistema e integridade:
- O projeto usa **ESLint** fortemente acoplado ao pipeline do **Vite** para detecção de variáveis ociosas, imports quebrados e falhas de ciclo de vida do React (Hooks).
- O backend de autenticação utiliza JWT (JSON Web Tokens) com _Refresh Tokens_ mantidos seguros nas sessões do browser, e roteamento inteligente (redirecionando imediatamente se o token expirar).
- As regras de RLS (Row Level Security) no Supabase garantem que operações DELETE, INSERT e UPDATE só possam ser feitas se o usuário possuir um cookie/JWT de sessão autenticado válido no sistema. As requisições de leitura (SELECT) na view pública são liberadas para os visitantes.
