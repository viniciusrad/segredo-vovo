-- Adicionar a coluna id_ponto_venda na tabela usuarios se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'usuarios' 
                  AND column_name = 'id_ponto_venda') THEN
        ALTER TABLE usuarios 
        ADD COLUMN id_ponto_venda UUID REFERENCES pontos_venda(id);
    END IF;
END $$;

-- Criar índice para melhorar performance das buscas
CREATE INDEX IF NOT EXISTS idx_usuarios_ponto_venda 
ON usuarios(id_ponto_venda);

-- Atualizar a função de busca de ponto de venda
CREATE OR REPLACE FUNCTION public.get_ponto_venda_usuario(usuario_id UUID)
RETURNS TABLE (
    id UUID,
    nome VARCHAR,
    endereco TEXT,
    responsavel VARCHAR,
    telefone VARCHAR,
    ativo BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT pv.*
    FROM pontos_venda pv
    INNER JOIN usuarios u ON u.id_ponto_venda = pv.id
    WHERE u.id = usuario_id;
END;
$$ LANGUAGE plpgsql; 