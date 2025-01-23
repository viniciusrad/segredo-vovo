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
  InputAdornment,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { refeicaoService } from '@/lib/supabase/services';
import { Refeicao } from '@/lib/supabase/types';
import { ConfirmacaoModal } from '@/components/ConfirmacaoModal';

interface RefeicaoComEdicao extends Refeicao {
  editando: boolean;
  quantidadeTemp: number;
  salvando: boolean;
}

export default function GerenciarRefeicoesPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [refeicoes, setRefeicoes] = useState<RefeicaoComEdicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error', mensagem: string } | null>(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [zerandoQuantidades, setZerandoQuantidades] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    carregarRefeicoes();
  }, []);

  const carregarRefeicoes = async () => {
    try {
      setLoading(true);
      const data = await refeicaoService.listarTodas();
      const refeicoesComEdicao = data.map(refeicao => ({
        ...refeicao,
        editando: false,
        quantidadeTemp: refeicao.quantidade_disponivel,
        salvando: false,
        disponivel: refeicao.quantidade_disponivel > 0
      }));
      setRefeicoes(refeicoesComEdicao);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar refeições');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantidadeChange = (id: string, valor: number) => {
    setRefeicoes(prev => prev.map(refeicao => {
      if (refeicao.id === id) {
        return {
          ...refeicao,
          quantidadeTemp: Math.max(0, valor),
          disponivel: valor > 0
        };
      }
      return refeicao;
    }));
  };

  const handleSalvarQuantidade = async (id: string) => {
    const refeicao = refeicoes.find(r => r.id === id);
    if (!refeicao) return;

    setRefeicoes(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, salvando: true };
      }
      return r;
    }));

    try {
      await refeicaoService.atualizarQuantidade(id, refeicao.quantidadeTemp);
      
      setRefeicoes(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            quantidade_disponivel: r.quantidadeTemp,
            disponivel: r.quantidadeTemp > 0,
            editando: false,
            salvando: false
          };
        }
        return r;
      }));

      setFeedback({
        tipo: 'success',
        mensagem: 'Quantidade atualizada com sucesso!'
      });
    } catch (err) {
      setFeedback({
        tipo: 'error',
        mensagem: err instanceof Error ? err.message : 'Erro ao atualizar quantidade'
      });
      
      setRefeicoes(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            quantidadeTemp: r.quantidade_disponivel,
            disponivel: r.quantidade_disponivel > 0,
            editando: false,
            salvando: false
          };
        }
        return r;
      }));
    }
  };

  const toggleEdicao = (id: string) => {
    setRefeicoes(prev => prev.map(refeicao => {
      if (refeicao.id === id) {
        return {
          ...refeicao,
          editando: !refeicao.editando,
          quantidadeTemp: refeicao.quantidade_disponivel
        };
      }
      return refeicao;
    }));
  };

  const handleZerarQuantidades = async () => {
    setZerandoQuantidades(true);
    try {
      await refeicaoService.zerarTodasQuantidades();
      await carregarRefeicoes(); // Recarrega as refeições após zerar
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

  return (
    <ProtectedRoute>
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 4,
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Stack spacing={3}>
          {/* Cabeçalho e Botões */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="h4" component="h1">
              Gerenciar Refeições
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              width={{ xs: '100%', sm: 'auto' }}
            >
              <Button
                fullWidth={isMobile}
                variant="contained"
                color="warning"
                startIcon={<DeleteSweepIcon />}
                onClick={() => setShowConfirmacao(true)}
                sx={{
                  background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                  boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
                  minWidth: { xs: '100%', sm: '160px' }
                }}
              >
                Zerar Refeições
              </Button>
              <Button
                fullWidth={isMobile}
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => router.push('/refeicoes/cadastro')}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  minWidth: { xs: '100%', sm: '160px' }
                }}
              >
                Nova Refeição
              </Button>
            </Stack>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Box sx={{ 
            width: '100%', 
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Grid 
              container 
              spacing={3} 
              sx={{ 
                margin: 0,
                width: '100%',
                maxWidth: 'lg',
                justifyContent: 'center',
                '& > .MuiGrid-item': {
                  paddingTop: 3,
                  paddingBottom: 3,
                  display: 'flex',
                  justifyContent: 'center'
                }
              }}
            >
              {refeicoes.map((refeicao) => (
                <Grid item xs={12} sm={6} md={4} key={refeicao.id}>
                  <Card 
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      width: '100%',
                      maxWidth: { xs: '100%', sm: '400px' },
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={2}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: 1
                        }}>
                          <Typography variant="h6" component="h2">
                            {refeicao.nome}
                          </Typography>
                          <Chip
                            label={refeicao.quantidade_disponivel > 0 ? "Disponível" : "Indisponível"}
                            color={refeicao.quantidade_disponivel > 0 ? "success" : "error"}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          {refeicao.descricao}
                        </Typography>

                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          flexWrap: 'wrap'
                        }}>
                          <Typography variant="h6" color="primary">
                            R$ {refeicao.preco.toFixed(2)}
                          </Typography>
                          {refeicao.editando ? (
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 1,
                              flexGrow: 1,
                              flexWrap: 'wrap'
                            }}>
                              <TextField
                                type="number"
                                size="small"
                                value={refeicao.quantidadeTemp}
                                onChange={(e) => handleQuantidadeChange(refeicao.id, parseInt(e.target.value) || 0)}
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">un</InputAdornment>,
                                }}
                                sx={{ minWidth: '100px' }}
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleSalvarQuantidade(refeicao.id)}
                                disabled={refeicao.salvando}
                                startIcon={<SaveIcon />}
                                sx={{ flexGrow: { xs: 1, sm: 0 } }}
                              >
                                Salvar
                              </Button>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {refeicao.quantidade_disponivel} unidades disponíveis
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ 
                      justifyContent: 'flex-end',
                      p: 2,
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => router.push(`/refeicoes/${refeicao.id}`)}
                        sx={{ flexGrow: { xs: 1, sm: 0 } }}
                      >
                        Ver Detalhes
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => router.push(`/refeicoes/${refeicao.id}/editar`)}
                        sx={{ flexGrow: { xs: 1, sm: 0 } }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color={refeicao.editando ? "error" : "primary"}
                        onClick={() => toggleEdicao(refeicao.id)}
                        sx={{ flexGrow: { xs: 1, sm: 0 } }}
                      >
                        {refeicao.editando ? "Cancelar" : "Ajustar Quantidade"}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>

        <ConfirmacaoModal
          open={showConfirmacao}
          onClose={() => setShowConfirmacao(false)}
          onConfirm={handleZerarQuantidades}
          titulo="Zerar Todas as Quantidades"
          mensagem="Tem certeza que deseja zerar a quantidade de todas as refeições? Esta ação não pode ser desfeita."
          loading={zerandoQuantidades}
        />

        <Snackbar
          open={!!feedback}
          autoHideDuration={6000}
          onClose={() => setFeedback(null)}
        >
          {feedback && (
            <Alert 
              onClose={() => setFeedback(null)} 
              severity={feedback.tipo}
              sx={{ width: '100%' }}
            >
              {feedback.mensagem}
            </Alert>
          )}
        </Snackbar>
      </Container>
    </ProtectedRoute>
  );
} 