# 🛡️ GSIPP - Grupo de Segurança da Informação e Preservação da Privacidade

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

Plataforma oficial do **GSIPP (Grupo de Segurança da Informação e Preservação da Privacidade)** da Universidade Federal do Ceará (UFC) - Campus Crateús. O projeto consiste em um portal público e um painel administrativo seguro para a gestão de conteúdos do grupo de pesquisa.

---

## 🎯 Funcionalidades

### 🌐 Portal Público
* **Página Inicial:** Apresentação do grupo, missão e visão.
* **Membros:** Listagem de professores, alunos e pesquisadores (com links para Lattes, LinkedIn e ResearchGate).
* **Publicações:** Artigos, livros e resumos publicados pelo grupo.
* **Notícias & Eventos:** Atualizações recentes e calendário de eventos.

### 🔒 Painel Administrativo (`/gestao-gsipp`)
* **Autenticação Segura:** Login, logout e recuperação de senha gerenciados via Supabase Auth.
* **Dashboard:** Visão geral das métricas do portal.
* **Gestão de Conteúdo (CRUD):** 
  * Adição, edição e remoção de Membros, Publicações, Notícias e Eventos.
* **Performance Otimizada:** Implementação de _Lazy Loading_ para separar o código do painel administrativo do site público.
* **Error Boundaries:** Tratamento global de erros para evitar telas em branco.

---

## 💻 Tecnologias Utilizadas

* **Frontend:** React 18, Vite, TypeScript
* **Estilização:** Tailwind CSS, Framer Motion (Animações), Lucide React (Ícones)
* **Backend & Banco de Dados:** Supabase (PostgreSQL, Auth, Storage)
* **Roteamento:** React Router DOM (com suporte a Code Splitting/Lazy Loading)
* **Testes:** Vitest + React Testing Library

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js (v18 ou superior)
* npm ou yarn
* Conta no [Supabase](https://supabase.com/) com um projeto configurado.

### 1. Clonar o repositório
```bash
git clone https://github.com/gsipp/gsipp.github.io.git
cd gsipp.github.io
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key_do_supabase
```

### 4. Rodar o servidor de desenvolvimento
```bash
npm run dev
```
O projeto estará disponível em: `http://localhost:5173`

---

## 📁 Estrutura de Diretórios Principal

```text
src/
├── assets/         # Imagens estáticas e SVGs
├── components/     # Componentes reutilizáveis (Layout, Ícones, Modais)
├── contexts/       # Contextos globais do React (AuthContext)
├── layouts/        # Layouts estruturais (AdminLayout, etc)
├── lib/            # Configurações de bibliotecas de terceiros (Supabase)
├── pages/          # Telas do site público e Painel Admin
├── utils/          # Funções utilitárias (Tradutor de erros, formatadores)
├── App.tsx         # Arquivo principal de roteamento
└── main.tsx        # Ponto de entrada da aplicação
```

---

## 🛠️ Scripts Disponíveis

* `npm run dev`: Inicia o servidor de desenvolvimento local.
* `npm run build`: Faz o build de produção otimizado com _code-splitting_.
* `npm run preview`: Visualiza o build de produção localmente.
* `npm run lint`: Roda o ESLint para verificar problemas no código.
* `npm run test`: Executa a suíte de testes usando Vitest.

---

## 🤝 Equipe de Desenvolvimento
Projeto desenvolvido e mantido pela equipe do **GSIPP - UFC Crateús**.
