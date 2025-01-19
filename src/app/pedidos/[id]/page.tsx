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
  Grid,
  Chip
} from '@mui/material';
import { Pedido } from '@/lib/supabase/types';
import { pedidoService } from '@/lib/supabase/services';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';

export default function DetalhesPedidoPage() {
  const params = useParams();
  const router = useRouter();
  const { usuario } = useAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarPedido = async () => {
      try {
        if (!params.id) {
          throw new Error('ID do pedido não fornecido');
        }
        const data = await pedidoService.buscarPorId(params.id as string);
        if (!data) {
          throw new Error('Pedido não encontrado');
        }
        setPedido(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    carregarPedido();
  }, [params.id]);

  const atualizarStatus = async (novoStatus: 'separado' | 'entregue' | 'cancelado') => {
    try {
      if (!pedido) return;
      
      await pedidoService.atualizarStatus(pedido.id, novoStatus);
      // Recarregar o pedido
      const pedidoAtualizado = await pedidoService.buscarPorId(pedido.id);
      setPedido(pedidoAtualizado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    }
  };

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

  if (!pedido) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Pedido não encontrado</Alert>
        <Button sx={{ mt: 2 }} onClick={() => router.back()}>
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1">
                Detalhes do Pedido
              </Typography>
              <Chip
                label={pedido.status}
                color={
                  pedido.status === 'entregue' ? 'success' :
                  pedido.status === 'separado' ? 'warning' :
                  pedido.status === 'cancelado' ? 'error' : 'default'
                }
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon color="action" />
                    <Typography variant="subtitle1">
                      Data e Hora:
                    </Typography>
                    <Typography>
                      {new Date(pedido.data_pedido).toLocaleString('pt-BR')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="action" />
                    <Typography variant="subtitle1">
                      Cliente:
                    </Typography>
                    <Typography>
                      {pedido.usuarios?.nome || 'Cliente não encontrado'}
                    </Typography>
                  </Box>

                  {pedido.usuarios?.telefone && (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                      Telefone: {pedido.usuarios.telefone}
                    </Typography>
                  )}

                  {pedido.usuarios?.endereco && (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                      Endereço: {pedido.usuarios.endereco}
                    </Typography>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestaurantIcon color="action" />
                    <Typography variant="subtitle1">
                      Refeição:
                    </Typography>
                    <Typography>
                      {pedido.refeicoes?.nome || 'Refeição não encontrada'}
                    </Typography>
                  </Box>

                  {pedido.refeicoes?.descricao && (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                      {pedido.refeicoes.descricao}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalAtmIcon color="action" />
                    <Typography variant="subtitle1">
                      Valor Total:
                    </Typography>
                    <Typography color="primary" variant="h6">
                      R$ {pedido.valor_total.toFixed(2)}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                    Quantidade: {pedido.quantidade} unidade(s)
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            <Divider />

            {usuario?.perfil === 'admin' && pedido.status !== 'cancelado' && (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => atualizarStatus('cancelado')}
                >
                  Cancelar Pedido
                </Button>
                {pedido.status === 'separado' && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => atualizarStatus('entregue')}
                  >
                    Marcar como Entregue
                  </Button>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Button variant="outlined" onClick={() => router.back()}>
                Voltar
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
} 