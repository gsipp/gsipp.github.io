-- Migração para ajustar timezone padrão para Brasília (UTC-3)
-- Execute este script no SQL Editor do Supabase

-- 1. Ajustar Notícias
alter table noticias 
alter column created_at set default timezone('America/Sao_Paulo'::text, now()),
alter column data_publicacao set default timezone('America/Sao_Paulo'::text, now());

-- 2. Ajustar Membros
alter table membros 
alter column created_at set default timezone('America/Sao_Paulo'::text, now());

-- 3. Ajustar Eventos
alter table eventos 
alter column created_at set default timezone('America/Sao_Paulo'::text, now());

-- 4. Ajustar Editais
alter table editais 
alter column created_at set default timezone('America/Sao_Paulo'::text, now());

-- 5. Ajustar Publicações
alter table publicacoes 
alter column created_at set default timezone('America/Sao_Paulo'::text, now());

-- Nota: Isso apenas muda o padrão para NOVAS inserções. 
-- Dados existentes que foram salvos como UTC continuarão como UTC 
-- internamente, mas as funções de exibição no frontend já tratam isso.
