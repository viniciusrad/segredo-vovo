import { supabase } from '../config';
import { Refeicao } from '../types';

export const refeicaoService = {
  async listarTodas(): Promise<Refeicao[]> {
    const { data, error } = await supabase
      .from('refeicoes')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  async buscarPorId(id: string): Promise<Refeicao | null> {
    const { data, error } = await supabase
      .from('refeicoes')
      .select('*')
      .eq('id', id)
      .single();

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

      //  apenas a quantidade
      const { data, error } = await supabase
        .from('refeicoes')
        .update({
          quantidade_disponivel: quantidade
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
  }
}; 