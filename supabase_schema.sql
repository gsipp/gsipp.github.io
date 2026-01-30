-- Tabela de Membros
create table if not exists membros (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  nome text not null,
  cargo text not null, -- Ex: 'Docente', 'Discente', 'Egresso'
  area_pesquisa text,
  lattes_url text,
  linkedin_url text,
  foto_url text,
  ordem integer default 0 -- Para ordenação personalizada
);

-- Tabela de Notícias
create table if not exists noticias (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  titulo text not null,
  slug text not null unique,
  resumo text,
  conteudo text, -- Markdown ou HTML
  data_publicacao timestamp with time zone default timezone('America/Sao_Paulo'::text, now()),
  imagem_capa_url text,
  publicado boolean default true
);

-- Tabela de Publicações
create table if not exists publicacoes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  titulo text not null,
  ano integer not null,
  autores text not null,
  veiculo text, -- Conferência, Revista, etc.
  link_doi text,
  link_pdf text
);

-- Tabela de Eventos
create table if not exists eventos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  titulo text not null,
  data_evento timestamp with time zone,
  local text,
  descricao text,
  link_inscricao text,
  imagem_url text
);

-- Criação de Buckets de Storage (Imagens)
-- Nota: Buckets precisam ser criados via dashboard ou api específica, mas policies podem ser definidas aqui
-- insert into storage.buckets (id, name, public) values ('images', 'images', true);

-- Row Level Security (RLS) Policies
-- Permitir leitura pública para todos
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

-- Políticas de Escrita (Apenas autenticados - Admin)
-- Exemplo simples: permitir tudo para usuários logados. 
-- Em produção, refine para checkar role ou email específico.
drop policy if exists "Apenas autenticados modifcam membros" on membros;
create policy "Apenas autenticados modifcam membros" on membros for all using (auth.role() = 'authenticated');
drop policy if exists "Apenas autenticados modifcam noticias" on noticias;
create policy "Apenas autenticados modifcam noticias" on noticias for all using (auth.role() = 'authenticated');
drop policy if exists "Apenas autenticados modifcam publicacoes" on publicacoes;
create policy "Apenas autenticados modifcam publicacoes" on publicacoes for all using (auth.role() = 'authenticated');
drop policy if exists "Apenas autenticados modifcam eventos" on eventos;
create policy "Apenas autenticados modifcam eventos" on eventos for all using (auth.role() = 'authenticated');

-- Criar usuario admin inicial (Executar apenas se necessario e com extensao pgcrypto habilitada)
-- create extension if not exists pgcrypto;

-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@admin.com') THEN
--     INSERT INTO auth.users (
--       instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
--     ) VALUES (
--       '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'admin@admin.com', crypt('admin025', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
--     );
--   END IF;
-- END $$;
