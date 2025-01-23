'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Pedido } from '@/lib/supabase/types';
import { pedidoService } from '@/lib/supabase/services';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLoading } from '@/contexts/LoadingContext';

export default function SeparacaoPedidosPage() {
  const { startLoading, stopLoading } = useLoading();
  const [pedidos, setPedidos] = useState<(Pedido & { itensVerificados: string[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarPedidos();
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const pedidosData = await pedidoService.listarTodos();
      
      // Filtra apenas os pedidos do dia atual com status 'solicitado'
      const hoje = new Date().toISOString().split('T')[0];
      const pedidosFiltrados = pedidosData
        .filter(pedido => 
          pedido.data_pedido.split('T')[0] === hoje && 
          pedido.status === 'solicitado'
        )
        .map(pedido => ({
          ...pedido,
          itensVerificados: []
        }));

      setPedidos(pedidosFiltrados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = (pedidoId: string, item: string) => {
    setPedidos(prev => prev.map(pedido => {
      if (pedido.id === pedidoId) {
        const itensVerificados = pedido.itensVerificados.includes(item)
          ? pedido.itensVerificados.filter(i => i !== item)
          : [...pedido.itensVerificados, item];
        return { ...pedido, itensVerificados };
      }
      return pedido;
    }));
  };

  const handleConfirmarSeparacao = async (pedidoId: string) => {
    try {
      startLoading();
      await pedidoService.atualizarStatus(pedidoId, 'separado');
      await carregarPedidos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar separação');
    } finally {
      stopLoading();
    }
  };

  const todosItensVerificados = (pedido: Pedido & { itensVerificados: string[] }) => {
    return pedido.porcoes?.length === pedido.itensVerificados.length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute perfisPermitidos={['admin', 'funcionario']}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Separação de Pedidos
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {pedidos.length === 0 ? (
            <Alert severity="info">
              Não há pedidos aguardando separação no momento.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {pedidos.map((pedido) => (
                <Grid item xs={12} sm={6} md={4} key={pedido.id}>
                  <Card 
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        {/* Cabeçalho */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">
                            Pedido #{pedido.id.slice(-4)}
                          </Typography>
                          <Chip
                            label={`${pedido.quantidade}x`}
                            color="primary"
                            size="small"
                          />
                        </Box>

                        <Typography variant="body1" color="text.secondary">
                          {pedido.refeicoes?.nome}
                        </Typography>

                        <Divider />

                        {/* Lista de Verificação */}
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Itens para Separar:
                          </Typography>
                          <Stack>
                            {pedido.porcoes?.map((item, index) => (
                              <FormControlLabel
                                key={index}
                                control={
                                  <Checkbox
                                    checked={pedido.itensVerificados.includes(item)}
                                    onChange={() => handleToggleItem(pedido.id, item)}
                                    color="success"
                                  />
                                }
                                label={item}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleConfirmarSeparacao(pedido.id)}
                        disabled={!todosItensVerificados(pedido)}
                        fullWidth
                      >
                        Confirmar Separação
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </ProtectedRoute>
  );
} 