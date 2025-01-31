-- Criar a tabela de pontos de venda
CREATE TABLE IF NOT EXISTS pontos_venda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON pontos_venda
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Inserir alguns pontos de venda iniciais
INSERT INTO pontos_venda (nome, endereco, responsavel, telefone, ativo)
VALUES 
    ('Matriz', 'Rua Principal, 123', 'João Silva', '(11) 99999-9999', true),
    ('Filial 1', 'Av. Secundária, 456', 'Maria Santos', '(11) 88888-8888', true),
    ('Filial 2', 'Praça Central, 789', 'Pedro Oliveira', '(11) 77777-7777', true)
ON CONFLICT (id) DO NOTHING; 