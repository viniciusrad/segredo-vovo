export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  created_at?: string;
  updated_at?: string;
}

export interface Refeicao {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  disponivel: boolean;
  imagem_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  refeicao_id: string;
  quantidade: number;
  valor_total: number;
  status: 'pendente' | 'entregue' | 'cancelado';
  data_pedido: string;
  created_at?: string;
  updated_at?: string;
} 