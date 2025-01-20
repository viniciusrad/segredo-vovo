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
  quantidade_disponivel: number;
  ingredientes: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  refeicao_id: string;
  quantidade: number;
  valor_total: number;
  status: 'pendente' | 'separado' | 'entregue' | 'cancelado';
  data_pedido: string;
  created_at?: string;
  updated_at?: string;
  usuarios?: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    endereco?: string;
  };
  refeicoes?: {
    id: string;
    nome: string;
    preco: number;
    descricao?: string;
  };
}

export type PerfilUsuario = 'admin' | 'atendente' | 'cliente';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  perfil: PerfilUsuario;
  foto_url?: string;
  cliente_id?: string;
  telefone?: string;
  endereco?: string;
  saldo_refeicoes?: number;
  created_at?: string;
  updated_at?: string;
} 