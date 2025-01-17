import { supabase } from '../config';
import { Pedido } from '../types';

export const pedidoService = {
  async listarTodos(): Promise<Pedido[]> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          id,
          nome
        ),
        refeicoes (
          id,
          nome,
          preco
        )
      `)
      .order('data_pedido', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async buscarPorId(id: string): Promise<Pedido | null> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          endereco
        ),
        refeicoes (
          id,
          nome,
          preco,
          descricao
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async criar(pedido: Omit<Pedido, 'id' | 'created_at' | 'updated_at'>): Promise<Pedido> {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedido])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizarStatus(id: string, status: Pedido['status']): Promise<Pedido> {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async listarPorCliente(clienteId: string): Promise<Pedido[]> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        refeicoes (
          id,
          nome,
          preco
        )
      `)
      .eq('cliente_id', clienteId)
      .order('data_pedido', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}; 