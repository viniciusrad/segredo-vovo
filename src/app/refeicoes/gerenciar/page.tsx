'use client';
import { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { refeicaoService } from '@/lib/supabase/services';
import { Refeicao } from '@/lib/supabase/types';

export default function GerenciarRefeicoes() {
  const { usuario } = useAuth();
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error', mensagem: string } | null>(null);
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    carregarRefeicoes();
  }, []);

  const carregarRefeicoes = async () => {
    try {
      const data = await refeicaoService.listarTodas();
      setRefeicoes(data);
      const quantidadesIniciais = data.reduce((acc, refeicao) => ({
        ...acc,
        [refeicao.id]: refeicao.quantidade_disponivel
      }), {});
      setQuantidades(quantidadesIniciais);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar refeições');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantidadeChange = (id: string, valor: string) => {
    const quantidade = Math.max(0, parseInt(valor) || 0);
    setQuantidades(prev => ({
      ...prev,
      [id]: quantidade
    }));
  };

  const atualizarQuantidade = async (refeicao: Refeicao) => {
    try {
      const novaQuantidade = quantidades[refeicao.id];
      
      if (novaQuantidade === undefined) {
        setFeedback({
          tipo: 'error',
          mensagem: 'Quantidade inválida'
        });
        return;
      }

      console.log('Tentando atualizar quantidade:', {
        id: refeicao.id,
        quantidade: novaQuantidade,
        refeicaoAtual: refeicao
      });

      await refeicaoService.atualizarQuantidade(refeicao.id, novaQuantidade);
      
      setFeedback({
        tipo: 'success',
        mensagem: 'Quantidade atualizada com sucesso!'
      });
      
      await carregarRefeicoes();
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
      setFeedback({
        tipo: 'error',
        mensagem: err instanceof Error ? err.message : 'Erro ao atualizar quantidade'
      });
    }
  };

  if (!usuario || usuario.perfil !== 'admin') {
    return <Typography>Acesso não autorizado</Typography>;
  }

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Gerenciar Refeições
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Preço</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Quantidade Disponível</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {refeicoes.map((refeicao) => (
                <TableRow key={refeicao.id}>
                  <TableCell>{refeicao.nome}</TableCell>
                  <TableCell>{refeicao.descricao}</TableCell>
                  <TableCell align="center">R$ {refeicao.preco.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    {refeicao.disponivel ? "Disponível" : "Indisponível"}
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={quantidades[refeicao.id] || 0}
                      onChange={(e) => handleQuantidadeChange(refeicao.id, e.target.value)}
                      InputProps={{ inputProps: { min: 0 } }}
                      sx={{ width: '100px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary"
                      onClick={() => atualizarQuantidade(refeicao)}
                      title="Salvar quantidade"
                    >
                      <SaveIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={!!feedback}
          autoHideDuration={3000}
          onClose={() => setFeedback(null)}
        >
          <Alert 
            severity={feedback?.tipo || 'info'} 
            onClose={() => setFeedback(null)}
          >
            {feedback?.mensagem}
          </Alert>
        </Snackbar>
      </Container>
    </ProtectedRoute>
  );
} 