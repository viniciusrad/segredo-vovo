'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Button,
  CardActions
} from '@mui/material';
import { refeicaoService, pontoVendaService, pedidoService } from '@/lib/supabase/services';
import { Refeicao, PontoVenda, StatusPedido } from '@/lib/supabase/types';
import { formatarPreco } from '@/utils/formatters';
import { QuantidadeSelector } from '@/components/QuantidadeSelector';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

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
      id={`ponto-venda-tabpanel-${index}`}
      aria-labelledby={`ponto-venda-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function RegistrarPedidoPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [pontosVenda, setPontosVenda] = useState<PontoVenda[]>([]);
  const [tabAtual, setTabAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [pontosVendaData, refeicoesData] = await Promise.all([
        pontoVendaService.listarTodos(),
        refeicaoService.listarTodas()
      ]);

      setPontosVenda(pontosVendaData);
      setRefeicoes(refeicoesData);

      const quantidadesIniciais = refeicoesData.reduce((acc, refeicao) => ({
        ...acc,
        [refeicao.id]: 1
      }), {});
      setQuantidades(quantidadesIniciais);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const getRefeicoesPontoVenda = (pontoVendaId: string) => {
    return refeicoes.filter(refeicao => {
      const estoquePontoVenda = refeicao.estoque?.find(
        e => e.id_ponto_venda === pontoVendaId
      );
      return estoquePontoVenda?.disponivel;
    });
  };

  const getQuantidadeDisponivel = (refeicao: Refeicao, pontoVendaId: string) => {
    const estoquePontoVenda = refeicao.estoque?.find(
      e => e.id_ponto_venda === pontoVendaId
    );
    return estoquePontoVenda?.quantidade_disponivel || 0;
  };

  const handleQuantidadeChange = (id: string, quantidade: number) => {
    setQuantidades(prev => ({
      ...prev,
      [id]: quantidade
    }));
  };

  const handleReservar = async (refeicao: Refeicao, pontoVendaId: string) => {
    try {
      const estoquePontoVenda = refeicao.estoque?.find(
        e => e.id_ponto_venda === pontoVendaId
      );

      if (!estoquePontoVenda) {
        setError('Estoque não encontrado para o ponto de venda');
        return;
      }

      const quantidade = quantidades[refeicao.id] || 1;
      
      if (quantidade > estoquePontoVenda.quantidade_disponivel) {
        setError(`Quantidade solicitada maior que a disponível (${estoquePontoVenda.quantidade_disponivel})`);
        return;
      }

      setLoading(true);

      // Criar pedido anônimo
      const pedido = {
        refeicao_id: refeicao.id,
        quantidade: quantidade,
        valor_total: refeicao.preco * quantidade,
        status: 'solicitado' as StatusPedido,
        data_pedido: new Date().toISOString(),
        porcoes: []
      };

      const novoPedido = await pedidoService.criar(pedido);

      // Atualizar estoque
      const novaQuantidade = estoquePontoVenda.quantidade_disponivel - quantidade;
      const { error: erroEstoque } = await supabase
        .from('estoque_refeicoes')
        .update({ 
          quantidade_disponivel: novaQuantidade,
          disponivel: novaQuantidade > 0 
        })
        .eq('id', estoquePontoVenda.id);

      if (erroEstoque) {
        console.error('Erro ao atualizar estoque:', erroEstoque);
        throw new Error('Erro ao atualizar estoque');
      }

      // Resetar quantidade
      setQuantidades(prev => ({
        ...prev,
        [refeicao.id]: 1
      }));

      // Recarregar dados atualizados
      await carregarDados();

    } catch (err) {
      console.error('Erro ao processar pedido:', err);
      setError('Não foi possível processar o pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
      <Typography variant="h4" component="h1" gutterBottom>
        Fazer Pedido
      </Typography>

      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabAtual}
            onChange={(_, newValue) => setTabAtual(newValue)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            aria-label="Pontos de Venda"
          >
            {pontosVenda.map((pv, index) => (
              <Tab
                key={pv.id}
                label={pv.nome}
                id={`ponto-venda-tab-${index}`}
                aria-controls={`ponto-venda-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {pontosVenda.map((pontoVenda, index) => {
          const refeicoesDoPonto = getRefeicoesPontoVenda(pontoVenda.id);

          return (
            <TabPanel key={pontoVenda.id} value={tabAtual} index={index}>
              <Typography variant="h5" component="h2" gutterBottom>
                Cardápio - {pontoVenda.nome}
              </Typography>
              {refeicoesDoPonto.length === 0 ? (
                <Alert severity="info">
                  Não há refeições disponíveis neste ponto de venda.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {refeicoesDoPonto.map((refeicao) => (
                    <Grid item xs={12} sm={6} md={4} key={refeicao.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {refeicao.imagem_url && (
                          <CardMedia
                            component="div"
                            sx={{ position: 'relative', height: 200 }}
                          >
                            <Image
                              src={refeicao.imagem_url}
                              alt={refeicao.nome}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </CardMedia>
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {refeicao.nome}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {refeicao.descricao}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" color="primary">
                              {formatarPreco(refeicao.preco)}
                            </Typography>
                            <Chip
                              label={`${getQuantidadeDisponivel(refeicao, pontoVenda.id)} disponíveis`}
                              color={getQuantidadeDisponivel(refeicao, pontoVenda.id) > 0 ? 'success' : 'error'}
                            />
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <QuantidadeSelector
                              quantidade={quantidades[refeicao.id] || 1}
                              onChange={(novaQuantidade) => handleQuantidadeChange(refeicao.id, novaQuantidade)}
                              max={getQuantidadeDisponivel(refeicao, pontoVenda.id)}
                            />
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleReservar(refeicao, pontoVenda.id)}
                            disabled={getQuantidadeDisponivel(refeicao, pontoVenda.id) === 0}
                          >
                            Reservar
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
          );
        })}
      </Box>
    </Container>
  );
} 