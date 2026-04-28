-- =================================================================
-- GSIPP — Supabase Schema (atualizado em 2026-04-27)
-- Fonte de verdade do banco. Sempre manter sincronizado com as
-- interfaces TypeScript em /src/pages/admin/*.tsx
-- =================================================================

-- ------------------------------------------
-- TABELA: membros
-- ------------------------------------------
create table if not exists membros (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  nome text not null,
  cargo text not null,              -- 'Docente' | 'Doutorando' | 'Mestrando' | 'Graduando' | 'Egresso'
  area_pesquisa text,
  lattes_url text,
  lattes_id text,                   -- Ex: K1105632T3
  linkedin_url text,
  foto_url text,
  email text,
  cpf text,                         -- CPF do membro (manter privado via RLS)
  data_entrada date,                -- Data de ingresso no grupo
  data_saida date,                  -- Data de saída (null = ainda ativo)
  carga_horaria integer,            -- Horas semanais dedicadas ao grupo
  ordem integer default 0           -- Ordenação personalizada no site
);

-- ------------------------------------------
-- TABELA: noticias
-- ------------------------------------------
create table if not exists noticias (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  titulo text not null,
  slug text not null unique,
  resumo text,
  conteudo text,                    -- Markdown
  data_publicacao timestamp with time zone default timezone('America/Sao_Paulo'::text, now()),
  imagem_capa_url text,
  publicado boolean default true
);

-- ------------------------------------------
-- TABELA: publicacoes
-- ------------------------------------------
create table if not exists publicacoes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  titulo text not null,
  ano integer not null,
  autores text not null,
  tipo text,                        -- 'Artigo' | 'Tese' | 'Dissertação' | 'Capítulo de Livro' | 'Outro'
  link_url text,                    -- URL principal (DOI, PDF, ou repositório)
  veiculo text                      -- Conferência, Revista, etc.
);

-- ------------------------------------------
-- TABELA: eventos
-- ------------------------------------------
create table if not exists eventos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  titulo text not null,
  descricao text,
  tipo text,                        -- 'Seminário' | 'Defesa' | 'Workshop' | 'Palestra' | 'Outro'
  data_evento timestamp with time zone,
  horario time,                     -- Horário do evento (HH:MM)
  local text,
  link_inscricao text,
  imagem_url text,
  membros_palestrantes_ids uuid[]   -- Array de UUIDs de membros palestrantes
);

-- ------------------------------------------
-- TABELA: editais
-- ------------------------------------------
create table if not exists editais (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  titulo text not null,
  descricao text,
  link_pdf text,
  data_abertura date,
  data_fechamento date,
  status text default 'Aberto',     -- 'Aberto' | 'Fechado' | 'Em Análise'
  ordem integer default 0
);

-- ------------------------------------------
-- STORAGE BUCKETS
-- ------------------------------------------
-- Criar via dashboard ou API:
-- insert into storage.buckets (id, name, public) values ('images', 'images', true);

-- ------------------------------------------
-- ROW LEVEL SECURITY — Leitura Pública
-- ------------------------------------------
alter table membros enable row level security;
drop policy if exists "Membros são públicos" on membros;
create policy "Membros são públicos" on membros for select using (true);

alter table noticias enable row level security;
drop policy if exists "Notícias são públicas" on noticias;
create policy "Notícias são públicas" on noticias for select using (true);

alter table publicacoes enable row level security;
drop policy if exists "Publicações são públicas" on publicacoes;
create policy "Publicações são públicas" on publicacoes for select using (true);

alter table eventos enable row level security;
drop policy if exists "Eventos são públicos" on eventos;
create policy "Eventos são públicos" on eventos for select using (true);

alter table editais enable row level security;
drop policy if exists "Editais são públicos" on editais;
create policy "Editais são públicos" on editais for select using (true);

-- ------------------------------------------
-- ROW LEVEL SECURITY — Escrita (Admin)
-- ------------------------------------------
-- AVISO: Em produção, refine para verificar email específico ou custom claim.
-- Exemplo com claim: auth.jwt() ->> 'role' = 'admin'

drop policy if exists "Apenas autenticados modifcam membros" on membros;
create policy "Apenas autenticados modificam membros" on membros for all using (auth.role() = 'authenticated');

drop policy if exists "Apenas autenticados modifcam noticias" on noticias;
create policy "Apenas autenticados modificam noticias" on noticias for all using (auth.role() = 'authenticated');

drop policy if exists "Apenas autenticados modifcam publicacoes" on publicacoes;
create policy "Apenas autenticados modificam publicacoes" on publicacoes for all using (auth.role() = 'authenticated');

drop policy if exists "Apenas autenticados modifcam eventos" on eventos;
create policy "Apenas autenticados modificam eventos" on eventos for all using (auth.role() = 'authenticated');

drop policy if exists "Apenas autenticados modificam editais" on editais;
create policy "Apenas autenticados modificam editais" on editais for all using (auth.role() = 'authenticated');

-- ------------------------------------------
-- MIGRATIONS NECESSÁRIAS (se banco já existe)
-- Execute apenas os campos ausentes:
-- ------------------------------------------
-- alter table membros add column if not exists cpf text;
-- alter table membros add column if not exists data_entrada date;
-- alter table membros add column if not exists data_saida date;
-- alter table membros add column if not exists carga_horaria integer;
-- alter table publicacoes add column if not exists tipo text;
-- alter table publicacoes add column if not exists link_url text;
-- alter table eventos add column if not exists tipo text;
-- alter table eventos add column if not exists horario time;
-- alter table eventos add column if not exists membros_palestrantes_ids uuid[];
