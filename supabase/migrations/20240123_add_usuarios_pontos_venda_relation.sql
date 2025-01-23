-- Primeiro, garantir que a coluna id_ponto_venda existe e é do tipo UUID
ALTER TABLE usuarios
ALTER COLUMN id_ponto_venda TYPE uuid USING id_ponto_venda::uuid;

-- Adicionar a foreign key constraint
ALTER TABLE usuarios
ADD CONSTRAINT fk_usuarios_pontos_venda
FOREIGN KEY (id_ponto_venda)
REFERENCES pontos_venda(id)
ON DELETE SET NULL
ON UPDATE CASCADE; 