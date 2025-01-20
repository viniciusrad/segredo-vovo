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
  Button,
  TextField,
  Snackbar,
  Divider,
  Collapse
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { usuarioService, pedidoService } from '@/lib/supabase/services';
import { aquisicaoService } from '@/lib/supabase/services/aquisicaoService';
import { Usuario, Pedido } from '@/lib/supabase/types';

export default function DetalhesClientePage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [cliente, setCliente] = useState<Usuario | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAquisicaoForm, setShowAquisicaoForm] = useState(false);
  const [quantidade, setQuantidade] = useState<number>(0);
  const [valorUnitario, setValorUnitario] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error', mensagem: string } | null>(null);
  const [processando, setProcessando] = useState(false);

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

  const handleAquisicao = async () => {
    if (!quantidade || !valorUnitario || quantidade <= 0 || valorUnitario <= 0) {
      setFeedback({
        tipo: 'error',
        mensagem: 'Por favor, preencha valores válidos para quantidade e valor unitário'
      });
      return;
    }

    try {
      setProcessando(true);
      await aquisicaoService.criar({
        cliente_id: id as string,
        quantidade,
        valor_unitario: valorUnitario
      });

      setFeedback({
        tipo: 'success',
        mensagem: 'Aquisição registrada com sucesso!'
      });
      
      // Recarregar dados do cliente para atualizar o saldo
      await carregarDadosCliente();
      
      // Limpar formulário
      setQuantidade(0);
      setValorUnitario(0);
      setShowAquisicaoForm(false);
    } catch (err) {
      setFeedback({
        tipo: 'error',
        mensagem: err instanceof Error ? err.message : 'Erro ao registrar aquisição'
      });
    } finally {
      setProcessando(false);
    }
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
  const valorTotal = quantidade * valorUnitario;

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

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" color="primary">
                    Saldo de Refeições: {cliente?.saldo_refeicoes || 0}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Estatísticas e Aquisição */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
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

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAquisicaoForm(!showAquisicaoForm)}
                fullWidth
              >
                {showAquisicaoForm ? 'Cancelar Aquisição' : 'Nova Aquisição de Refeições'}
              </Button>

              <Collapse in={showAquisicaoForm}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6">Nova Aquisição</Typography>
                    
                    <TextField
                      label="Quantidade"
                      type="number"
                      value={quantidade}
                      onChange={(e) => setQuantidade(Number(e.target.value))}
                      disabled={processando}
                      fullWidth
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                    
                    <TextField
                      label="Valor Unitário (R$)"
                      type="number"
                      value={valorUnitario}
                      onChange={(e) => setValorUnitario(Number(e.target.value))}
                      disabled={processando}
                      fullWidth
                      InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />

                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Resumo da Aquisição
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Valor Total:</Typography>
                        <Typography variant="h6" color="primary">
                          R$ {valorTotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </Paper>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAquisicao}
                      disabled={processando || !quantidade || !valorUnitario}
                      fullWidth
                    >
                      {processando ? 'Processando...' : 'Confirmar Aquisição'}
                    </Button>
                  </Stack>
                </Paper>
              </Collapse>
            </Stack>
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