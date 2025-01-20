'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { usuarioService, pedidoService } from '@/lib/supabase/services';
import { Usuario, Pedido } from '@/lib/supabase/types';

export default function DetalhesClientePage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [cliente, setCliente] = useState<Usuario | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      carregarDadosCliente();
    }
  }, [id]);

  const carregarDadosCliente = async () => {
    try {
      setLoading(true);
      const clienteData = await usuarioService.buscarPorId(id as string);
      if (!clienteData) {
        throw new Error('Cliente não encontrado');
      }
      setCliente(clienteData);

      const pedidosCliente = await pedidoService.listarPorCliente(id as string);
      setPedidos(pedidosCliente);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = () => {
    const totalPedidos = pedidos.length;
    const valorTotal = pedidos.reduce((sum, pedido) => sum + pedido.valor_total, 0);
    const pedidosEntregues = pedidos.filter(p => p.status === 'entregue').length;

    return {
      totalPedidos,
      valorTotal,
      pedidosEntregues,
    };
  };

  if (!usuario || usuario.perfil !== 'admin') {
    return <Typography>Acesso não autorizado</Typography>;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const estatisticas = calcularEstatisticas();

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Detalhes do Cliente
        </Typography>

        <Grid container spacing={3}>
          {/* Informações do Cliente */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="h6">{cliente?.nome}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Typography>{cliente?.email}</Typography>
                </Box>

                {cliente?.telefone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="action" />
                    <Typography>{cliente.telefone}</Typography>
                  </Box>
                )}

                {cliente?.endereco && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon color="action" />
                    <Typography>{cliente.endereco}</Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Estatísticas */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total de Pedidos
                  </Typography>
                  <Typography variant="h6">
                    {estatisticas.totalPedidos}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Pedidos Entregues
                  </Typography>
                  <Typography variant="h6">
                    {estatisticas.pedidosEntregues}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Valor Total
                  </Typography>
                  <Typography variant="h6">
                    R$ {estatisticas.valorTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Histórico de Pedidos */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Histórico de Pedidos
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Data</TableCell>
                    <TableCell>Refeição</TableCell>
                    <TableCell align="center">Quantidade</TableCell>
                    <TableCell align="center">Valor Total</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidos.map((pedido) => (
                    <TableRow key={pedido.id} hover>
                      <TableCell>
                        {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
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
                          color={
                            pedido.status === 'entregue' ? 'success' :
                            pedido.status === 'separado' ? 'warning' :
                            pedido.status === 'cancelado' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </ProtectedRoute>
  );
} 