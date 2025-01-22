import { supabase } from '../config';
import { PontoVenda } from '../types';

export const pontoVendaService = {
  async listarTodos(): Promise<PontoVenda[]> {
    const { data, error } = await supabase
      .from('pontos_venda')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  async buscarPorId(id: string): Promise<PontoVenda | null> {
    const { data, error } = await supabase
      .from('pontos_venda')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async criar(pontoVenda: Omit<PontoVenda, 'id' | 'created_at' | 'updated_at'>): Promise<PontoVenda> {
    const { data, error } = await supabase
      .from('pontos_venda')
      .insert([pontoVenda])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizar(id: string, pontoVenda: Partial<PontoVenda>): Promise<PontoVenda> {
    const { data, error } = await supabase
      .from('pontos_venda')
      .update(pontoVenda)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from('pontos_venda')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 