'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pedidoService } from '@/lib/supabase/services';
import { Pedido } from '@/lib/supabase/types';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';

const statusColors = {
  solicitado: 'warning',
  separado: 'info',
  pronto: 'success',
  entregue: 'default',
  cancelado: 'error'
} as const;

export function HistoricoPedidos() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario?.id) {
      carregarPedidos();
    }
  }, [usuario?.id]);

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const data = await pedidoService.listarPorCliente(usuario!.id);
      setPedidos(data);
    } catch (err) {
      setError('Erro ao carregar histórico de pedidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Histórico de Pedidos
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Refeição</TableCell>
              <TableCell align="center">Quantidade</TableCell>
              <TableCell align="right">Valor Total</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id} hover>
                <TableCell>
                  {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                </TableCell>
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
                    color={statusColors[pedido.status]}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
            {pedidos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhum pedido encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 