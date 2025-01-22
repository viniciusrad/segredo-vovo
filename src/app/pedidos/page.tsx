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
  Stack,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useRouter } from 'next/navigation';
import { Pedido, PontoVenda } from '@/lib/supabase/types';
import { pedidoService, pontoVendaService } from '@/lib/supabase/services';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useLoading } from '@/contexts/LoadingContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pedidos-tabpanel-${index}`}
      aria-labelledby={`pedidos-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function PedidosPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { startLoading, stopLoading } = useLoading();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pontosVenda, setPontosVenda] = useState<PontoVenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [tabAtual, setTabAtual] = useState(0);

  useEffect(() => {
    carregarDados();
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarDados, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [pedidosData, pontosVendaData] = await Promise.all([
        pedidoService.listarTodos(),
        pontoVendaService.listarTodos()
      ]);

      // Filtra apenas os pedidos do dia atual
      const hoje = new Date().toISOString().split('T')[0];
      const pedidosHoje = pedidosData.filter(pedido => 
        pedido.data_pedido.split('T')[0] === hoje
      );

      // Adiciona o ponto de venda "Todos" e ordena os pontos de venda por nome
      const pontosVendaOrdenados = [
        { id: 'todos', nome: 'Todos', endereco: '', responsavel: '', telefone: '', ativo: true },
        ...pontosVendaData.sort((a, b) => a.nome.localeCompare(b.nome))
      ];

      setPedidos(pedidosHoje);
      setPontosVenda(pontosVendaOrdenados);

      // Conta quantos pedidos existem para cada ponto de venda
      const pedidosPorPonto = pontosVendaOrdenados.map(ponto => ({
        id: ponto.id,
        quantidade: ponto.id === 'todos' 
          ? pedidosHoje.length 
          : pedidosHoje.filter(p => p.usuarios?.id_ponto_venda === ponto.id).length
      }));

      // Se não houver pedidos no ponto de venda selecionado, muda para a aba "Todos"
      if (tabAtual !== 0 && pedidosPorPonto[tabAtual].quantidade === 0) {
        setTabAtual(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarStatus = async (id: string, novoStatus: 'entregue' | 'cancelado') => {
    try {
      startLoading();
      await pedidoService.atualizarStatus(id, novoStatus);
      await carregarDados();
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
      await carregarDados();
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

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabAtual(newValue);
  };

  const filtrarPedidosPorPontoVenda = (pedidos: Pedido[], pontoVendaId: string) => {
    if (pontoVendaId === 'todos') return pedidos;
    return pedidos.filter(pedido => pedido.usuarios?.id_ponto_venda === pontoVendaId);
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

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabAtual} 
              onChange={handleChangeTab}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{
                '.MuiTabs-scrollButtons.Mui-disabled': {
                  opacity: 0.3,
                },
              }}
            >
              {pontosVenda.map((ponto, index) => {
                const pedidosDoPonto = filtrarPedidosPorPontoVenda(pedidos, ponto.id);
                const quantidadePedidos = pedidosDoPonto.length;
                
                return (
                  <Tab 
                    key={ponto.id} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{ponto.nome}</span>
                        {quantidadePedidos > 0 && (
                          <Chip 
                            label={quantidadePedidos} 
                            size="small" 
                            color="primary"
                            sx={{ 
                              height: '20px',
                              minWidth: '20px',
                              '& .MuiChip-label': {
                                px: 1,
                              }
                            }}
                          />
                        )}
                      </Box>
                    }
                    id={`pedidos-tab-${index}`}
                    aria-controls={`pedidos-tabpanel-${index}`}
                  />
                );
              })}
            </Tabs>
          </Box>

          {pontosVenda.map((ponto, index) => {
            const pedidosFiltrados = filtrarPedidosPorPontoVenda(pedidos, ponto.id);
            
            return (
              <TabPanel key={ponto.id} value={tabAtual} index={index}>
                {pedidosFiltrados.length === 0 ? (
                  <Typography variant="body1" color="text.secondary" align="center">
                    Nenhum pedido encontrado para {ponto.id === 'todos' ? 'hoje' : `o ponto de venda ${ponto.nome}`}.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Horário</TableCell>
                          <TableCell>Cliente</TableCell>
                          {ponto.id === 'todos' && <TableCell>Ponto de Venda</TableCell>}
                          <TableCell>Refeição</TableCell>
                          <TableCell align="center">Quantidade</TableCell>
                          <TableCell align="right">Valor Total</TableCell>
                          <TableCell align="center">Status</TableCell>
                          <TableCell align="center">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pedidosFiltrados.map((pedido) => (
                          <TableRow key={pedido.id}>
                            <TableCell>
                              {new Date(pedido.data_pedido).toLocaleTimeString('pt-BR')}
                            </TableCell>
                            <TableCell>{pedido.usuarios?.nome}</TableCell>
                            {ponto.id === 'todos' && (
                              <TableCell>
                                {pontosVenda.find(p => p.id === pedido.usuarios?.id_ponto_venda)?.nome || '-'}
                              </TableCell>
                            )}
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
              </TabPanel>
            );
          })}
        </Paper>
      </Container>
    </ProtectedRoute>
  );
} 