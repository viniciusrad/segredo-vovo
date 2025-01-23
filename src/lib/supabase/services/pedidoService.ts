import { supabase } from '../config';
import { Pedido, Refeicao, StatusPedido } from '../types';

export const pedidoService = {
  async listarTodos(): Promise<Pedido[]> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        porcoes,
        usuarios:cliente_id (
          id,
          nome,
          email,
          telefone,
          id_ponto_venda
        ),
        refeicoes (
          id,
          nome,
          preco
        )
      `)
      .order('data_pedido', { ascending: false });

    if (error) throw error;
    
    // Garante que as guarnições sejam sempre um array
    const pedidosProcessados = data?.map(pedido => ({
      ...pedido,
      porcoes: Array.isArray(pedido.porcoes) 
        ? pedido.porcoes 
        : typeof pedido.porcoes === 'string'
          ? pedido.porcoes.split(',')
          : []
    })) || [];

    return pedidosProcessados;
  },

  async buscarPorId(id: string): Promise<Pedido | null> {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        usuarios:cliente_id (
          id,
          nome,
          email,
          telefone,
          id_ponto_venda
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

  async criar(pedido: Omit<Pedido, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .insert({
          ...pedido,
          status: 'solicitado' as StatusPedido
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
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
        usuarios:cliente_id (
          id,
          nome,
          email,
          telefone,
          id_ponto_venda
        ),
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
  },

  async criarPedidoEAtualizarQuantidade(
    pedido: Omit<Pedido, 'id' | 'created_at' | 'updated_at'>,
    refeicao: Refeicao
  ): Promise<{ pedido: Pedido; refeicao: Refeicao }> {
    // Verificar se há quantidade disponível suficiente
    if (refeicao.quantidade_disponivel < pedido.quantidade) {
      throw new Error('Quantidade solicitada não está disponível');
    }

    // Iniciar transação
    const { data: novosPedidos, error: errorPedido } = await supabase
      .from('pedidos')
      .insert([{
        ...pedido,
        status: 'solicitado' as StatusPedido,
        data_pedido: new Date().toISOString()
      }])
      .select()
      .single();

    if (errorPedido) throw errorPedido;

    // Atualizar quantidade disponível
    const novaQuantidade = refeicao.quantidade_disponivel - pedido.quantidade;
    const { data: refeicaoAtualizada, error: errorRefeicao } = await supabase
      .from('refeicoes')
      .update({ 
        quantidade_disponivel: novaQuantidade,
        disponivel: novaQuantidade > 0
      })
      .eq('id', refeicao.id)
      .select()
      .single();

    if (errorRefeicao) {
      // Se houver erro na atualização da quantidade, tentar reverter a criação do pedido
      await supabase
        .from('pedidos')
        .delete()
        .eq('id', novosPedidos.id);
      
      throw errorRefeicao;
    }

    return {
      pedido: novosPedidos,
      refeicao: refeicaoAtualizada
    };
  }
}; 