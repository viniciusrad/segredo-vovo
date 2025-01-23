import { supabase } from '../config';
import { Usuario, PerfilUsuario } from '../types';
import * as bcrypt from 'bcryptjs';
import Cookies from 'js-cookie';

interface LoginDTO {
  email: string;
  senha: string;
}

interface CadastroDTO {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  telefone: string;
  id_ponto_venda: string;
}

export const authService = {
  async login({ email, senha }: LoginDTO): Promise<Usuario> {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) throw new Error('Usuário não encontrado');
    
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) throw new Error('Senha incorreta');

    // Remove a senha antes de armazenar no cookie
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    // Armazena a sessão em um cookie seguro
    Cookies.set('session', JSON.stringify(usuarioSemSenha), {
      expires: 7, // expira em 7 dias
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return usuario;
  },

  async cadastrar({ nome, email, senha, perfil, telefone, id_ponto_venda }: CadastroDTO): Promise<Usuario> {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (usuarioExistente) {
      throw new Error('Email já cadastrado');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        email: email.toLowerCase(),
        senha: senhaCriptografada,
        perfil,
        telefone,
        id_ponto_venda
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUsuarioLogado(): Promise<Usuario | null> {
    const session = Cookies.get('session');
    if (!session) return null;

    try {
      const usuario = JSON.parse(session);
      return usuario;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    Cookies.remove('session');
  }
}; 