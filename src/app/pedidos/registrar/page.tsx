'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Paper,
  Stack
} from '@mui/material';
import { pedidoService, pontoVendaService } from '@/lib/supabase/services';
import { Pedido, PontoVenda } from '@/lib/supabase/types';
import { formatarPreco } from '@/utils/formatters';

interface PedidosPorPontoVenda {
  pontoVenda: PontoVenda;
  pedidos: Pedido[];
}

export default function RegistrarPedidoPage() {
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

      const pedidosSolicitados = todosPedidos.filter(p => p.status === 'solicitado');
      const pedidosAgrupados = pontosVenda.map(pv => ({
        pontoVenda: pv,
        pedidos: pedidosSolicitados.filter(p => p.id_ponto_venda === pv.id)
      })).filter(grupo => grupo.pedidos.length > 0);

      setPedidosPorPonto(pedidosAgrupados);
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
        Separação de Pedidos
      </Typography>

      {pedidosPorPonto.length === 0 ? (
        <Alert severity="info">Não há pedidos para separar no momento.</Alert>
      ) : (
        pedidosPorPonto.map(({ pontoVenda, pedidos }) => (
          <Card key={pontoVenda.id} sx={{ mb: 4, backgroundColor: 'white', boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                {pontoVenda.nome}
              </Typography>
              
              <Stack spacing={-1}>
                {pedidos.map((pedido, index) => (
                  <Paper 
                    key={pedido.id} 
                    elevation={1}
                    sx={{ 
                      p: 2,
                      mt: index === 0 ? 0 : -1,
                      position: 'relative',
                      zIndex: pedidos.length - index,
                      borderRadius: 2,
                      backgroundColor: index === 0 ? '#f3f8ff' : 'white',
                      border: '1px solid',
                      borderColor: index === 0 ? 'primary.main' : 'grey.300',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.2s ease-in-out'
                      }
                    }}
                  >
                    {index === 0 ? (
                      // Primeiro pedido - Detalhado
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                              {pedido.refeicoes?.nome}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Porções: {pedido.porcoes.join(', ') || 'Padrão'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantidade: {pedido.quantidade}
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleMarcarSeparado(pedido.id)}
                            sx={{ minWidth: 120 }}
                          >
                            Marcar Separado
                          </Button>
                        </Box>
                        <Box sx={{ 
                          p: 2, 
                          bgcolor: 'grey.50', 
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.200'
                        }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Pedido realizado em: {formatarData(pedido.data_pedido)}
                          </Typography>
                          {pedido.usuarios && (
                            <Typography variant="subtitle1" sx={{ mt: 1 }}>
                              Cliente: {pedido.usuarios.nome}
                            </Typography>
                          )}
                          <Typography variant="subtitle1" sx={{ mt: 1, color: 'primary.main', fontWeight: 'bold' }}>
                            Valor Total: {formatarPreco(pedido.valor_total)}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      // Demais pedidos - Compactos
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {pedido.refeicoes?.nome}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {pedido.porcoes.join(', ') || 'Padrão'} • {pedido.quantidade}x
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleMarcarSeparado(pedido.id)}
                        >
                          Separar
                        </Button>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
} 