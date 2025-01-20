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
  Button,
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

export default function PedidosPage() {
  const router = useRouter();
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
      await pedidoService.atualizarStatus(id, novoStatus);
      await carregarPedidos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do pedido');
    }
  };

  const confirmarPedido = async (pedidoId: string) => {
    try {
      setAtualizando(pedidoId);
      await pedidoService.atualizarStatus(pedidoId, 'separado');
      await carregarPedidos(); // Recarrega a lista após atualização
    } catch (err) {
      setError('Erro ao confirmar pedido');
      console.error(err);
    } finally {
      setAtualizando(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'entregue':
        return 'success';
      case 'separado':
        return 'warning';
      case 'cancelado':
        return 'error';
      case 'solicitado':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Pedidos do Dia
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={carregarPedidos}
              >
                Atualizar Lista
              </Button>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {pedidos.length === 0 ? (
            <Alert severity="info">Nenhum pedido registrado hoje.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Horário</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Refeição</TableCell>
                    <TableCell align="center">Quantidade</TableCell>
                    <TableCell align="center">Valor Total</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id} hover>
                      <TableCell>
                        {new Date(pedido.data_pedido).toLocaleTimeString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/clientes/${pedido.cliente_id}`);
                          }}
                          sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {pedido.usuarios?.nome || 'Cliente não encontrado'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {pedido.refeicoes?.nome || 'Refeição não encontrada'}
                      </TableCell>
                      <TableCell align="center">
                        {pedido.quantidade}
                      </TableCell>
                      <TableCell align="center">
                        R$ {pedido.valor_total.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={pedido.status}
                          color={getStatusColor(pedido.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            color="info"
                            onClick={() => router.push(`/pedidos/${pedido.id}`)}
                            title="Ver Detalhes"
                          >
                            <VisibilityIcon />
                          </IconButton>
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
                          {pedido.status === 'solicitado' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleOutlineIcon />}
                              onClick={() => confirmarPedido(pedido.id)}
                              disabled={atualizando === pedido.id}
                            >
                              {atualizando === pedido.id ? 'Confirmando...' : 'Confirmar'}
                            </Button>
                          )}
                        </Box>
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