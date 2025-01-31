import { supabase } from '../config';
import { Pedido, Refeicao, StatusPedido } from '../types';

export const pedidoService = {
  async listarTodos(): Promise<Pedido[]> {
    // Primeiro, buscar todos os pontos de venda
    const { data: pontosVenda, error: pontosVendaError } = await supabase
      .from('pontos_venda')
      .select('*');

    if (pontosVendaError) throw pontosVendaError;

    // Criar um mapa de pontos de venda para acesso rápido
    const pontosVendaMap = new Map(
      pontosVenda.map(pv => [pv.id, pv])
    );

    // Buscar os pedidos com dados do usuário
    const { data: pedidos, error: pedidosError } = await supabase
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

    if (pedidosError) throw pedidosError;
    
    // Processa os dados para incluir o ponto de venda e garantir o formato correto das porções
    const pedidosProcessados = (pedidos || []).map(pedido => ({
      ...pedido,
      usuarios: pedido.usuarios ? {
        ...pedido.usuarios,
        ponto_venda: pedido.usuarios.id_ponto_venda 
          ? pontosVendaMap.get(pedido.usuarios.id_ponto_venda)
          : undefined
      } : undefined,
      porcoes: Array.isArray(pedido.porcoes)
        ? pedido.porcoes
        : typeof pedido.porcoes === 'string'
          ? pedido.porcoes.split(',')
          : []
    }));

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

  async criar(pedido: Partial<Pedido>) {
    const { data, error } = await supabase
      .from('pedidos')
      .insert(pedido)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }

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