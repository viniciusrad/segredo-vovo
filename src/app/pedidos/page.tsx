'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/navigation';
import { Pedido } from '@/lib/supabase/types';
import { pedidoService } from '@/lib/supabase/services';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useLoading } from '@/contexts/LoadingContext';

export default function PedidosPage() {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState<string | null>(null);

  useEffect(() => {
    carregarPedidos();
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const data = await pedidoService.listarTodos();
      // Filtra apenas os pedidos do dia atual
      const hoje = new Date().toISOString().split('T')[0];
      const pedidosHoje = data.filter(pedido => 
        pedido.data_pedido.split('T')[0] === hoje
      );
      setPedidos(pedidosHoje);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarStatus = async (id: string, novoStatus: 'entregue' | 'cancelado') => {
    try {
      startLoading();
      await pedidoService.atualizarStatus(id, novoStatus);
      await carregarPedidos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do pedido');
    } finally {
      stopLoading();
    }
  };

  const confirmarPedido = async (pedidoId: string) => {
    try {
      setAtualizando(pedidoId);
      startLoading();
      await pedidoService.atualizarStatus(pedidoId, 'separado');
      await carregarPedidos(); // Recarrega a lista após atualização
    } catch (err) {
      setError('Erro ao confirmar pedido');
      console.error(err);
    } finally {
      setAtualizando(null);
      stopLoading();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solicitado':
        return 'warning';
      case 'separado':
        return 'info';
      case 'entregue':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const navegarParaDetalhesPedido = (pedidoId: string) => {
    startLoading();
    router.push(`/pedidos/${pedidoId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <ProtectedRoute perfisPermitidos={['admin', 'atendente']}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom component="div" sx={{ mb: 3 }}>
            Pedidos do Dia
          </Typography>

          {pedidos.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center">
              Nenhum pedido encontrado para hoje.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Horário</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Refeição</TableCell>
                    <TableCell align="center">Quantidade</TableCell>
                    <TableCell align="right">Valor Total</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>
                        {new Date(pedido.data_pedido).toLocaleTimeString('pt-BR')}
                      </TableCell>
                      <TableCell>{pedido.usuarios?.nome}</TableCell>
                      <TableCell>{pedido.refeicoes?.nome}</TableCell>
                      <TableCell align="center">{pedido.quantidade}</TableCell>
                      <TableCell align="right">
                        {pedido.valor_total.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={pedido.status}
                          color={getStatusColor(pedido.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            color="info"
                            onClick={() => navegarParaDetalhesPedido(pedido.id)}
                            title="Ver Detalhes"
                          >
                            <VisibilityIcon />
                          </IconButton>

                          {pedido.status === 'solicitado' && (
                            <IconButton
                              color="success"
                              onClick={() => confirmarPedido(pedido.id)}
                              disabled={atualizando === pedido.id}
                              title="Confirmar Pedido"
                            >
                              <CheckCircleOutlineIcon />
                            </IconButton>
                          )}

                          {pedido.status === 'separado' && (
                            <>
                              <IconButton
                                color="success"
                                onClick={() => handleAtualizarStatus(pedido.id, 'entregue')}
                                title="Marcar como Entregue"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleAtualizarStatus(pedido.id, 'cancelado')}
                                title="Cancelar Pedido"
                              >
                                <CancelIcon />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </ProtectedRoute>
  );
} 