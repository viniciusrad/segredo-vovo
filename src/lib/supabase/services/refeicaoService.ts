import { supabase } from '../config';
import { Refeicao, EstoqueRefeicao } from '../types';

export const refeicaoService = {
  async listarTodas(idPontoVenda?: string): Promise<Refeicao[]> {
    let query = supabase
      .from('refeicoes')
      .select(`
        *,
        estoque:estoque_refeicoes(*)
      `)
      .order('nome');

    if (idPontoVenda) {
      query = query.eq('estoque.id_ponto_venda', idPontoVenda);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async buscarPorId(id: string, idPontoVenda?: string): Promise<Refeicao | null> {
    let query = supabase
      .from('refeicoes')
      .select(`
        *,
        estoque:estoque_refeicoes(*)
      `)
      .eq('id', id);

    if (idPontoVenda) {
      query = query.eq('estoque.id_ponto_venda', idPontoVenda);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  },

  async criar(refeicao: Omit<Refeicao, 'id' | 'created_at' | 'updated_at'>): Promise<Refeicao> {
    const { data, error } = await supabase
      .from('refeicoes')
      .insert([refeicao])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizar(id: string, refeicao: Partial<Refeicao>): Promise<Refeicao> {
    const { data, error } = await supabase
      .from('refeicoes')
      .update(refeicao)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizarQuantidade(id: string, quantidade: number): Promise<Refeicao> {
    try {
      //se a refeição existe
      const { data: refeicaoExistente, error: errorBusca } = await supabase
        .from('refeicoes')
        .select('*')
        .eq('id', id)
        .single();

      if (errorBusca || !refeicaoExistente) {
        throw new Error('Refeição não encontrada');
      }

      // Atualiza quantidade e disponibilidade
      const { data, error } = await supabase
        .from('refeicoes')
        .update({
          quantidade_disponivel: quantidade,
          disponivel: quantidade > 0
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar quantidade:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data) {
        throw new Error('Erro ao retornar dados atualizados');
      }

      return data;
    } catch (error) {
      console.error('Erro durante a atualização:', {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  },

  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from('refeicoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async zerarTodasQuantidades(): Promise<void> {
    const { error } = await supabase
      .from('refeicoes')
      .update({ 
        quantidade_disponivel: 0,
        disponivel: false
      })
      .gt('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Erro ao zerar quantidades:', error);
      throw error;
    }
  },

  async atualizarEstoque(idRefeicao: string, idPontoVenda: string, quantidade: number): Promise<EstoqueRefeicao> {
    try {
      const { data: estoqueExistente, error: errorBusca } = await supabase
        .from('estoque_refeicoes')
        .select('*')
        .eq('id_refeicao', idRefeicao)
        .eq('id_ponto_venda', idPontoVenda)
        .single();

      if (errorBusca && errorBusca.code !== 'PGRST116') {
        throw errorBusca;
      }

      const { data, error } = await supabase
        .from('estoque_refeicoes')
        .upsert({
          id: estoqueExistente?.id,
          id_refeicao: idRefeicao,
          id_ponto_venda: idPontoVenda,
          quantidade_disponivel: quantidade,
          disponivel: quantidade > 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  },

  async zerarEstoque(idPontoVenda: string): Promise<void> {
    const { error } = await supabase
      .from('estoque_refeicoes')
      .update({ 
        quantidade_disponivel: 0,
        disponivel: false
      })
      .eq('id_ponto_venda', idPontoVenda);

    if (error) {
      console.error('Erro ao zerar estoque:', error);
      throw error;
    }
  }
}; 