import { supabase } from '../config';
import { Usuario, PerfilUsuario } from '../types';

interface CriarUsuarioDTO {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

export const usuarioService = {
  async listarTodos(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  async buscarPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async criar(usuario: CriarUsuarioDTO): Promise<Usuario> {
    // Primeiro, criar o usuário no auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: usuario.email,
      email_confirm: true,
      user_metadata: {
        full_name: usuario.nome
      }
    });

    if (authError) throw authError;

    // Depois, criar o registro na tabela de usuários
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        id: authData.user.id,
        email: usuario.email,
        nome: usuario.nome,
        perfil: usuario.perfil
      }])
      .select()
      .single();

    if (error) {
      // Se houver erro, tentar remover o usuário do auth para manter consistência
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }

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
    // Excluir o usuário do auth (isso vai disparar o cascade delete na tabela de usuários)
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
  }
}; 