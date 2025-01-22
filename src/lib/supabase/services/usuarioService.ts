import { supabase } from '../config';
import { Usuario } from '../types';

export const usuarioService = {
  async listarTodos(): Promise<Usuario[]> {
    try {
      const { data: usuarios, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');

      if (userError) throw userError;
      if (!usuarios) return [];

      const usuariosComPontoVenda = await Promise.all(
        usuarios.map(async (usuario) => {
          if (!usuario.id_ponto_venda) return usuario;

          try {
            const { data: pontoVenda, error: pontoVendaError } = await supabase
              .from('pontos_venda')
              .select('*')
              .eq('id', usuario.id_ponto_venda)
              .single();

            if (pontoVendaError) {
              console.error(`Erro ao buscar ponto de venda para usuário ${usuario.id}:`, pontoVendaError);
              return usuario;
            }

            return {
              ...usuario,
              ponto_venda: pontoVenda
            };
          } catch (err) {
            console.error(`Erro ao processar ponto de venda para usuário ${usuario.id}:`, err);
            return usuario;
          }
        })
      );

      return usuariosComPontoVenda;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  },

  async buscarPorId(id: string): Promise<Usuario | null> {
    try {
      console.log(`Buscando usuário com ID: ${id}`);
      
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw userError;
      }

      if (!usuario) {
        console.log('Usuário não encontrado');
        return null;
      }

      console.log('Usuário encontrado:', usuario);

      if (usuario.id_ponto_venda) {
        console.log(`Buscando ponto de venda com ID: ${usuario.id_ponto_venda}`);
        
        try {
          const { data: pontoVenda, error: pontoVendaError } = await supabase
            .from('pontos_venda')
            .select('*')
            .eq('id', usuario.id_ponto_venda)
            .single();

          if (pontoVendaError) {
            console.error('Erro ao buscar ponto de venda:', pontoVendaError);
            return usuario;
          }

          if (!pontoVenda) {
            console.log('Ponto de venda não encontrado');
            return usuario;
          }

          console.log('Ponto de venda encontrado:', pontoVenda);

          return {
            ...usuario,
            ponto_venda: pontoVenda
          };
        } catch (err) {
          console.error('Erro ao processar ponto de venda:', err);
          return usuario;
        }
      }

      return usuario;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  async criar(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([usuario])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async atualizar(id: string, usuario: Partial<Usuario>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuario)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async excluir(id: string): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 