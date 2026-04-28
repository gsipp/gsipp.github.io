-- Adicionar colunas para especialização de eventos
alter table eventos 
add column if not exists tipo text default 'Evento', -- 'Defesa', 'Palestra', 'Workshop', etc.
add column if not exists link_transmissao text,
add column if not exists link_certificado text,
add column if not exists duracao text,
add column if not exists horario text,
add column if not exists palestrante_externo text,
add column if not exists data_evento_2 timestamp with time zone,
add column if not exists membro_estudante_id uuid references membros(id),
add column if not exists membros_palestrantes_ids uuid[] default '{}',
add column if not exists membros_orientadores_ids uuid[] default '{}';

-- Comentários para documentação
comment on column eventos.tipo is 'Tipo do evento: Defesa, Palestra, Workshop, etc.';
comment on column eventos.membro_estudante_id is 'ID do membro (estudante) no caso de Defesa';
comment on column eventos.membros_palestrantes_ids is 'Lista de IDs de membros que são palestrantes';
comment on column eventos.membros_orientadores_ids is 'Lista de IDs de membros que são orientadores (para Defesa)';
