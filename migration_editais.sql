-- Tabela de Editais
create table if not exists editais (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('America/Sao_Paulo'::text, now()) not null,
  titulo text not null,
  descricao text,
  link_pdf text,
  data_abertura date,
  data_fechamento date,
  status text default 'Aberto', -- Ex: 'Aberto', 'Fechado', 'Em Análise'
  ordem integer default 0
);

-- Row Level Security (RLS)
alter table editais enable row level security;

-- Permitir leitura pública para todos
drop policy if exists "Editais são públicos" on editais;
create policy "Editais são públicos" on editais for select using (true);

-- Permissões de escrita (Apenas Admin autenticado)
drop policy if exists "Apenas autenticados modifcam editais" on editais;
create policy "Apenas autenticados modifcam editais" on editais for all using (auth.role() = 'authenticated');
