-- Criar a tabela de estoque de refeições por ponto de venda
CREATE TABLE estoque_refeicoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_refeicao UUID NOT NULL REFERENCES refeicoes(id) ON DELETE CASCADE,
    id_ponto_venda UUID NOT NULL REFERENCES pontos_venda(id) ON DELETE CASCADE,
    quantidade_disponivel INTEGER NOT NULL DEFAULT 0,
    disponivel BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(id_refeicao, id_ponto_venda)
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON estoque_refeicoes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Migrar os dados existentes
INSERT INTO estoque_refeicoes (id_refeicao, id_ponto_venda, quantidade_disponivel, disponivel)
SELECT 
    r.id as id_refeicao,
    pv.id as id_ponto_venda,
    r.quantidade_disponivel,
    r.disponivel
FROM refeicoes r
CROSS JOIN pontos_venda pv
WHERE pv.ativo = true; 