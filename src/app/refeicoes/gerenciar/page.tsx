'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { refeicaoService, pontoVendaService } from '@/lib/supabase/services';
import { Refeicao, PontoVenda } from '@/lib/supabase/types';
import { ConfirmacaoModal } from '@/components/ConfirmacaoModal';

interface RefeicaoComEdicao extends Refeicao {
  editando: { [key: string]: boolean };
  quantidadeTemp: { [key: string]: number };
  salvando: { [key: string]: boolean };
}

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

export default function GerenciarRefeicoesPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [refeicoes, setRefeicoes] = useState<RefeicaoComEdicao[]>([]);
  const [pontosVenda, setPontosVenda] = useState<PontoVenda[]>([]);
  const [tabAtual, setTabAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error', mensagem: string } | null>(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [zerandoQuantidades, setZerandoQuantidades] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [refeicoesData, pontosVendaData] = await Promise.all([
        refeicaoService.listarTodas(),
        pontoVendaService.listarTodos()
      ]);

      const refeicoesProcessadas = refeicoesData.map(refeicao => ({
        ...refeicao,
        editando: {},
        quantidadeTemp: {},
        salvando: {}
      }));

      setRefeicoes(refeicoesProcessadas);
      setPontosVenda(pontosVendaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantidadeChange = (refeicaoId: string, pontoVendaId: string, valor: number) => {
    setRefeicoes(prev => prev.map(refeicao => {
      if (refeicao.id === refeicaoId) {
        return {
          ...refeicao,
          quantidadeTemp: {
            ...refeicao.quantidadeTemp,
            [pontoVendaId]: Math.max(0, valor)
          }
        };
      }
      return refeicao;
    }));
  };

  const handleSalvarQuantidade = async (refeicaoId: string, pontoVendaId: string) => {
    const refeicao = refeicoes.find(r => r.id === refeicaoId);
    if (!refeicao) return;

    setRefeicoes(prev => prev.map(r => {
      if (r.id === refeicaoId) {
        return {
          ...r,
          salvando: { ...r.salvando, [pontoVendaId]: true }
        };
      }
      return r;
    }));

    try {
      await refeicaoService.atualizarEstoque(
        refeicaoId,
        pontoVendaId,
        refeicao.quantidadeTemp[pontoVendaId] || 0
      );
      
      await carregarDados();
      setFeedback({
        tipo: 'success',
        mensagem: 'Quantidade atualizada com sucesso!'
      });
    } catch (err) {
      setFeedback({
        tipo: 'error',
        mensagem: err instanceof Error ? err.message : 'Erro ao atualizar quantidade'
      });
    } finally {
      setRefeicoes(prev => prev.map(r => {
        if (r.id === refeicaoId) {
          return {
            ...r,
            editando: { ...r.editando, [pontoVendaId]: false },
            salvando: { ...r.salvando, [pontoVendaId]: false }
          };
        }
        return r;
      }));
    }
  };

  const toggleEdicao = (refeicaoId: string, pontoVendaId: string) => {
    setRefeicoes(prev => prev.map(refeicao => {
      if (refeicao.id === refeicaoId) {
        const estoqueAtual = refeicao.estoque?.find(e => e.id_ponto_venda === pontoVendaId);
        return {
          ...refeicao,
          editando: {
            ...refeicao.editando,
            [pontoVendaId]: !refeicao.editando[pontoVendaId]
          },
          quantidadeTemp: {
            ...refeicao.quantidadeTemp,
            [pontoVendaId]: estoqueAtual?.quantidade_disponivel || 0
          }
        };
      }
      return refeicao;
    }));
  };

  const handleZerarQuantidades = async (pontoVendaId: string) => {
    setZerandoQuantidades(true);
    try {
      await refeicaoService.zerarEstoque(pontoVendaId);
      await carregarDados();
      setFeedback({
        tipo: 'success',
        mensagem: 'Todas as quantidades foram zeradas com sucesso!'
      });
    } catch (err) {
      setFeedback({
        tipo: 'error',
        mensagem: err instanceof Error ? err.message : 'Erro ao zerar quantidades'
      });
    } finally {
      setZerandoQuantidades(false);
      setShowConfirmacao(false);
    }
  };

  const getEstoquePontoVenda = (refeicao: RefeicaoComEdicao, pontoVendaId: string) => {
    return refeicao.estoque?.find(e => e.id_ponto_venda === pontoVendaId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute perfisPermitidos={['admin']}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ width: '100%', mb: 4 }}>
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

          {pontosVenda.map((pontoVenda, index) => (
            <TabPanel key={pontoVenda.id} value={tabAtual} index={index}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h5" component="h2">
                    Gerenciar Refeições - {pontoVenda.nome}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<DeleteSweepIcon />}
                      onClick={() => handleZerarQuantidades(pontoVenda.id)}
                      disabled={zerandoQuantidades}
                    >
                      Zerar Quantidades
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() => router.push('/refeicoes/cadastro')}
                    >
                      Nova Refeição
                    </Button>
                  </Stack>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                <Grid container spacing={3}>
                  {refeicoes.map((refeicao) => {
                    const estoquePontoVenda = getEstoquePontoVenda(refeicao, pontoVenda.id);
                    const editando = refeicao.editando[pontoVenda.id];
                    const salvando = refeicao.salvando[pontoVenda.id];

                    return (
                      <Grid item xs={12} sm={6} md={4} key={refeicao.id}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {refeicao.nome}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {refeicao.descricao}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              {editando ? (
                                <TextField
                                  fullWidth
                                  type="number"
                                  label="Quantidade Disponível"
                                  value={refeicao.quantidadeTemp[pontoVenda.id] || 0}
                                  onChange={(e) => handleQuantidadeChange(
                                    refeicao.id,
                                    pontoVenda.id,
                                    parseInt(e.target.value)
                                  )}
                                  disabled={salvando}
                                  InputProps={{ inputProps: { min: 0 } }}
                                />
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body1">
                                    Quantidade Disponível:
                                  </Typography>
                                  <Chip
                                    label={estoquePontoVenda?.quantidade_disponivel || 0}
                                    color={estoquePontoVenda?.disponivel ? 'success' : 'error'}
                                  />
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                          <CardActions>
                            {editando ? (
                              <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => handleSalvarQuantidade(refeicao.id, pontoVenda.id)}
                                disabled={salvando}
                                startIcon={<SaveIcon />}
                              >
                                {salvando ? 'Salvando...' : 'Salvar'}
                              </Button>
                            ) : (
                              <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => toggleEdicao(refeicao.id, pontoVenda.id)}
                                startIcon={<EditIcon />}
                              >
                                Editar Quantidade
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Stack>
            </TabPanel>
          ))}
        </Paper>

        <Snackbar
          open={!!feedback}
          autoHideDuration={6000}
          onClose={() => setFeedback(null)}
        >
          <Alert
            onClose={() => setFeedback(null)}
            severity={feedback?.tipo}
            sx={{ width: '100%' }}
          >
            {feedback?.mensagem}
          </Alert>
        </Snackbar>

        <ConfirmacaoModal
          open={showConfirmacao}
          onClose={() => setShowConfirmacao(false)}
          onConfirm={() => handleZerarQuantidades(pontosVenda[tabAtual].id)}
          titulo="Zerar Quantidades"
          mensagem="Tem certeza que deseja zerar todas as quantidades? Esta ação não pode ser desfeita."
        />
      </Container>
    </ProtectedRoute>
  );
} 