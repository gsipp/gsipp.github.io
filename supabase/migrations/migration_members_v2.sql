-- Add new columns for enhanced member management
alter table membros 
add column if not exists cpf text,
add column if not exists email text,
add column if not exists carga_horaria text, -- Ex: "20h", "40h"
add column if not exists data_entrada date,
add column if not exists data_saida date;

-- Comment on columns
comment on column membros.cpf is 'CPF for internal management and certificates';
comment on column membros.email is 'Contact email';
comment on column membros.carga_horaria is 'Weekly workload (e.g. 20h)';
comment on column membros.data_entrada is 'Date of entry into the group';
comment on column membros.data_saida is 'Date of exit (if applicable)';
