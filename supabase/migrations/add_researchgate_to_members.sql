-- Adiciona a coluna researchgate_url na tabela membros
ALTER TABLE membros 
ADD COLUMN IF NOT EXISTS researchgate_url TEXT;

-- Comentário para documentação
COMMENT ON COLUMN membros.researchgate_url IS 'Link para o perfil do ResearchGate do membro';
