import { supabase } from '../config';

interface AquisicaoRefeicao {
  id: string;
  cliente_id: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  data_aquisicao: string;
  created_at?: string;
  updated_at?: string;
}

export const aquisicaoService = {
  async criar(dados: Omit<AquisicaoRefeicao, 'id' | 'created_at' | 'updated_at' | 'data_aquisicao' | 'valor_total'>): Promise<AquisicaoRefeicao> {
    const valorTotal = dados.quantidade * dados.valor_unitario;
    const agora = new Date().toISOString();

    // Iniciar transação
    const { data: aquisicao, error: errorAquisicao } = await supabase
      .from('aquisicoes_refeicoes')
      .insert([{
        ...dados,
        valor_total: valorTotal,
        data_aquisicao: agora
      }])
      .select()
      .single();

    if (errorAquisicao) throw errorAquisicao;

    // Buscar saldo atual do usuário
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .select('saldo_refeicoes')
      .eq('id', dados.cliente_id)
      .single();

    if (errorUsuario) {
      // Se houver erro na busca do usuário, reverter a aquisição
      await supabase
        .from('aquisicoes_refeicoes')
        .delete()
        .eq('id', aquisicao.id);
      
      throw errorUsuario;
    }

    // Calcular novo saldo
    const saldoAtual = usuario?.saldo_refeicoes || 0;
    const novoSaldo = saldoAtual + dados.quantidade;

    // Atualizar saldo do usuário
    const { error: errorUpdate } = await supabase
      .from('usuarios')
      .update({ saldo_refeicoes: novoSaldo })
      .eq('id', dados.cliente_id);

    if (errorUpdate) {
      // Se houver erro na atualização do saldo, reverter a aquisição
      await supabase
        .from('aquisicoes_refeicoes')
        .delete()
        .eq('id', aquisicao.id);
      
      throw errorUpdate;
    }

    return aquisicao;
  },

  async listarPorCliente(clienteId: string): Promise<AquisicaoRefeicao[]> {
    const { data, error } = await supabase
      .from('aquisicoes_refeicoes')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('data_aquisicao', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}; 