'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  TextField,
  Snackbar,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Refeicao } from '@/lib/supabase/types';
import { refeicaoService } from '@/lib/supabase/services';
import { pedidoService } from '@/lib/supabase/services';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GUARNICOES } from '@/app/conts';

const ReservaRefeicaoPage = () => {
  const params = useParams();
  const router = useRouter();
  const { usuario } = useAuth();
  const [refeicao, setRefeicao] = useState<Refeicao | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error', mensagem: string } | null>(null);
  const [guarnicoesPersonalizadas, setGuarnicoesPersonalizadas] = useState<string[]>([]);

  useEffect(() => {
    carregarRefeicao();
  }, [params.id]);

  useEffect(() => {
    if (refeicao?.ingredientes) {
      setGuarnicoesPersonalizadas([...refeicao.ingredientes]);
    }
  }, [refeicao]);

  const handleRemoverGuarnicao = (guarnicao: string) => {
    setGuarnicoesPersonalizadas(prev => prev.filter(g => g !== guarnicao));
  };

  const handleAdicionarGuarnicao = (guarnicao: string) => {
    if (!guarnicoesPersonalizadas.includes(guarnicao)) {
      setGuarnicoesPersonalizadas(prev => [...prev, guarnicao]);
    }
  };

  const getGuarnicoesDisponiveis = () => {
    return GUARNICOES.filter(g => !guarnicoesPersonalizadas.includes(g));
  };

  const carregarRefeicao = async () => {
    try {
      if (!params.id) {
        throw new Error('ID da refeição não fornecido');
      }
      const data = await refeicaoService.buscarPorId(params.id as string);
      if (!data) {
        throw new Error('Refeição não encontrada');
      }
      setRefeicao(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar refeição');
    } finally {
      setLoading(false);
    }
  };

  const handleReservar = async () => {
    if (!refeicao || !usuario) return;

    setProcessando(true);
    setError(null);

    try {
      await pedidoService.criarPedidoEAtualizarQuantidade(
        {
          cliente_id: usuario.id,
          refeicao_id: refeicao.id,
          quantidade: quantidade,
          valor_total: refeicao.preco * quantidade,
          status: 'separado',
          data_pedido: new Date().toISOString(),
          porcoes: guarnicoesPersonalizadas
        },
        refeicao
      );

      setFeedback({
        tipo: 'success',
        mensagem: 'Reserva realizada com sucesso!'
      });

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error('Erro ao realizar reserva:', err);
      setError(err instanceof Error ? err.message : 'Erro ao realizar reserva');
      setFeedback({
        tipo: 'error',
        mensagem: err instanceof Error ? err.message : 'Erro ao realizar reserva'
      });
    } finally {
      setProcessando(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button sx={{ mt: 2 }} onClick={() => router.back()}>
            Voltar
          </Button>
        </Container>
      );
    }

    if (!refeicao) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="warning">Refeição não encontrada</Alert>
          <Button sx={{ mt: 2 }} onClick={() => router.back()}>
            Voltar
          </Button>
        </Container>
      );
    }

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Reserva de Refeição
          </Typography>

          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {refeicao.nome}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {refeicao.descricao}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Guarnições Selecionadas
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {guarnicoesPersonalizadas.map((guarnicao, index) => (
                  <Chip
                    key={index}
                    label={guarnicao}
                    color="primary"
                    onDelete={() => handleRemoverGuarnicao(guarnicao)}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Guarnições Disponíveis
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {getGuarnicoesDisponiveis().map((guarnicao, index) => (
                  <Chip
                    key={index}
                    label={guarnicao}
                    color="secondary"
                    variant="outlined"
                    onClick={() => handleAdicionarGuarnicao(guarnicao)}
                    icon={<AddCircleOutlineIcon />}
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Informações da Reserva
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Preço unitário:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {refeicao.preco.toFixed(2)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Quantidade disponível:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={refeicao.quantidade_disponivel > 0 ? 'success.main' : 'error.main'}
                  >
                    {refeicao.quantidade_disponivel} unidades
                  </Typography>
                </Box>

                {refeicao.quantidade_disponivel > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Quantidade desejada:
                    </Typography>
                    <TextField
                      type="number"
                      value={quantidade}
                      onChange={(e) => {
                        const valor = parseInt(e.target.value);
                        if (valor > 0 && valor <= refeicao.quantidade_disponivel) {
                          setQuantidade(valor);
                        }
                      }}
                      inputProps={{
                        min: 1,
                        max: refeicao.quantidade_disponivel
                      }}
                      size="small"
                      sx={{ width: 100 }}
                    />
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Valor total:
                  </Typography>
                  <Typography variant="h5" color="primary">
                    R$ {(refeicao.preco * quantidade).toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => router.back()}
                fullWidth
                disabled={processando}
              >
                Voltar
              </Button>
              {refeicao.quantidade_disponivel > 0 && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleReservar}
                  fullWidth
                  disabled={processando}
                >
                  {processando ? 'Processando...' : 'Confirmar Reserva'}
                </Button>
              )}
            </Box>

            {refeicao.quantidade_disponivel === 0 && (
              <Alert severity="error">
                Não há unidades disponíveis para reserva no momento.
              </Alert>
            )}
          </Stack>
        </Paper>

        <Snackbar
          open={!!feedback}
          autoHideDuration={6000}
          onClose={() => setFeedback(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            severity={feedback?.tipo || 'info'} 
            onClose={() => setFeedback(null)}
            sx={{ width: '100%' }}
          >
            {feedback?.mensagem}
          </Alert>
        </Snackbar>
      </Container>
    );
  };

  return (
    <ProtectedRoute>
      {renderContent()}
    </ProtectedRoute>
  );
};

export default ReservaRefeicaoPage; 