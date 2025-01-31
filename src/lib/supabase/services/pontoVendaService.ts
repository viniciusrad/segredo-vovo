import { supabase } from '../config';
import { PontoVenda } from '../types';

export const pontoVendaService = {
  async listarTodos(): Promise<PontoVenda[]> {
    try {
      console.log('Iniciando busca de pontos de venda...');
      
      const { data, error } = await supabase
        .from('pontos_venda')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar pontos de venda:', error);
        throw error;
      }

      console.log('Pontos de venda encontrados:', data);
      return data || [];
    } catch (err) {
      console.error('Erro no serviço de pontos de venda:', err);
      throw err;
    }
  },

  async buscarPorId(id: string): Promise<PontoVenda | null> {
    try {
      const { data, error } = await supabase
        .from('pontos_venda')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar ponto de venda por ID:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar ponto de venda:', err);
      throw err;
    }
  },

  async buscarPorUsuario(usuarioId: string): Promise<PontoVenda | null> {
    try {
      console.log('Buscando ponto de venda do usuário:', usuarioId);
      
      // Primeiro, busca o ID do ponto de venda do usuário
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('id_ponto_venda')
        .eq('id', usuarioId)
        .single();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw userError;
      }

      if (!usuario?.id_ponto_venda) {
        console.log('Usuário não possui ponto de venda vinculado');
        return null;
      }

      // Depois, busca os detalhes do ponto de venda
      const { data: pontoVenda, error: pvError } = await supabase
        .from('pontos_venda')
        .select('*')
        .eq('id', usuario.id_ponto_venda)
        .single();

      if (pvError) {
        console.error('Erro ao buscar detalhes do ponto de venda:', pvError);
        throw pvError;
      }

      console.log('Dados do ponto de venda do usuário:', pontoVenda);
      return pontoVenda;
    } catch (err) {
      console.error('Erro ao buscar ponto de venda do usuário:', err);
      throw err;
    }
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