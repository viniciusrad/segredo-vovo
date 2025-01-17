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

  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from('refeicoes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 