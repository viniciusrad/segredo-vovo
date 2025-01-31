'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  Alert,
  CircularProgress,
  Button,
  Stack,
  Chip
} from '@mui/material';
import { pedidoService, pontoVendaService } from '@/lib/supabase/services';
import { Pedido, PontoVenda } from '@/lib/supabase/types';
import { formatarPreco } from '@/utils/formatters';
import StorefrontIcon from '@mui/icons-material/Storefront';
import WarningIcon from '@mui/icons-material/Warning';

interface PedidosPorPontoVenda {
  pontoVenda: PontoVenda | null;
  pedidos: Pedido[];
}

export default function SeparacaoPedidosPage() {
  const [pedidosPorPonto, setPedidosPorPonto] = useState<PedidosPorPontoVenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [pontosVenda, todosPedidos] = await Promise.all([
        pontoVendaService.listarTodos(),
        pedidoService.listarTodos()
      ]);

      // Filtra pedidos do dia atual
      const hoje = new Date().toISOString().split('T')[0];
      const pedidosDoDia = todosPedidos.filter(pedido => {
        const dataPedido = pedido.data_pedido?.split('T')[0];
        return dataPedido === hoje;
      });

      // Separa pedidos sem ponto de venda
      const pedidosSemPonto = pedidosDoDia.filter(p => !p.id_ponto_venda);

      // Agrupa pedidos com ponto de venda
      const pedidosComPonto = pontosVenda.map(pv => ({
        pontoVenda: pv,
        pedidos: pedidosDoDia.filter(p => p.id_ponto_venda === pv.id)
      })).filter(grupo => grupo.pedidos.length > 0);

      // Adiciona grupo de pedidos sem ponto de venda se houver algum
      const todosGrupos = pedidosSemPonto.length > 0 
        ? [...pedidosComPonto, { pontoVenda: null, pedidos: pedidosSemPonto }]
        : pedidosComPonto;

      setPedidosPorPonto(todosGrupos);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarSeparado = async (pedidoId: string) => {
    try {
      await pedidoService.atualizarStatus(pedidoId, 'separado');
      await carregarDados();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Não foi possível atualizar o status do pedido.');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'text.primary' }}>
        Pedidos do Dia
      </Typography>

      {pedidosPorPonto.length === 0 ? (
        <Alert severity="info">Não há pedidos registrados hoje.</Alert>
      ) : (
        <Stack spacing={3}>
          {pedidosPorPonto.map(({ pontoVenda, pedidos }) => (
            <Card key={pontoVenda?.id || 'sem-ponto'} sx={{ 
              backgroundColor: 'white', 
              boxShadow: 2,
              overflow: 'visible'
            }}>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: pontoVenda ? 'white' : 'warning.light'
              }}>
                {pontoVenda ? (
                  <StorefrontIcon color="primary" />
                ) : (
                  <WarningIcon color="warning" />
                )}
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                  {pontoVenda?.nome || 'Pedidos sem Ponto de Venda'}
                </Typography>
                <Typography variant="body2" sx={{ ml: 'auto', color: 'text.secondary' }}>
                  {pedidos.length} pedidos
                </Typography>
              </Box>
              
              <Stack>
                {pedidos.map((pedido, index) => (
                  <Box
                    key={pedido.id}
                    sx={{
                      p: 2,
                      borderBottom: '1px solid',
                      borderColor: 'grey.200',
                      backgroundColor: index === 0 ? '#f8faff' : 'white',
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    {index === 0 ? (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Pedido #{pedido.id.slice(-4)}
                              </Typography>
                              <Chip 
                                label={`${pedido.quantidade}x`}
                                color="primary"
                                size="small"
                              />
                              <Chip 
                                label={pedido.status}
                                color={
                                  pedido.status === 'solicitado' ? 'warning' :
                                  pedido.status === 'separado' ? 'info' :
                                  pedido.status === 'pronto' ? 'success' :
                                  pedido.status === 'entregue' ? 'default' :
                                  'error'
                                }
                                size="small"
                              />
                            </Box>
                            <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}>
                              {pedido.refeicoes?.nome}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {pedido.porcoes.join(', ') || 'Porção padrão'}
                            </Typography>
                          </Box>
                          {pedido.status === 'solicitado' && (
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleMarcarSeparado(pedido.id)}
                            >
                              CONFIRMAR SEPARAÇÃO
                            </Button>
                          )}
                        </Box>
                        <Box sx={{ 
                          display: 'flex',
                          gap: 4,
                          color: 'text.secondary',
                          fontSize: '0.875rem'
                        }}>
                          <Box>
                            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                              Data do Pedido
                            </Typography>
                            {formatarData(pedido.data_pedido)}
                          </Box>
                          {pedido.usuarios && (
                            <Box>
                              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                Cliente
                              </Typography>
                              {pedido.usuarios.nome}
                            </Box>
                          )}
                          <Box>
                            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                              Valor Total
                            </Typography>
                            {formatarPreco(pedido.valor_total)}
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              Pedido #{pedido.id.slice(-4)}
                            </Typography>
                            <Chip 
                              label={`${pedido.quantidade}x`}
                              color="primary"
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              label={pedido.status}
                              color={
                                pedido.status === 'solicitado' ? 'warning' :
                                pedido.status === 'separado' ? 'info' :
                                pedido.status === 'pronto' ? 'success' :
                                pedido.status === 'entregue' ? 'default' :
                                'error'
                              }
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2">
                            {pedido.refeicoes?.nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {pedido.porcoes.join(', ') || 'Porção padrão'}
                          </Typography>
                        </Box>
                        {pedido.status === 'solicitado' && (
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => handleMarcarSeparado(pedido.id)}
                          >
                            CONFIRMAR
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
} 