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
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Chip,
  Divider,
  InputAdornment
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { refeicaoService } from '@/lib/supabase/services';
import { Refeicao } from '@/lib/supabase/types';

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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Gerenciar Refeições
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => router.push('/refeicoes/cadastro')}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
            }}
          >
            Nova Refeição
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={3}>
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
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {refeicao.nome}
                    </Typography>
                    <Chip
                      label={refeicao.quantidade_disponivel > 0 ? "Disponível" : "Indisponível"}
                      color={refeicao.quantidade_disponivel > 0 ? "success" : "error"}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {refeicao.descricao}
                  </Typography>

                  <Typography variant="h6" color="primary" gutterBottom>
                    R$ {refeicao.preco.toFixed(2)}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      label="Quantidade"
                      type="number"
                      size="small"
                      value={refeicao.editando ? refeicao.quantidadeTemp : refeicao.quantidade_disponivel}
                      onChange={(e) => handleQuantidadeChange(refeicao.id, Number(e.target.value))}
                      disabled={!refeicao.editando || refeicao.salvando}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() => refeicao.editando ? handleSalvarQuantidade(refeicao.id) : toggleEdicao(refeicao.id)}
                              disabled={refeicao.salvando}
                              color={refeicao.editando ? "primary" : "default"}
                            >
                              {refeicao.editando ? <SaveIcon /> : <EditIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        inputProps: { min: 0 }
                      }}
                      fullWidth
                    />
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => router.push(`/refeicoes/${refeicao.id}/editar`)}
                  >
                    Editar Detalhes
                  </Button>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => router.push(`/refeicoes/${refeicao.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Snackbar
          open={!!feedback}
          autoHideDuration={3000}
          onClose={() => setFeedback(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={feedback?.tipo || 'info'} 
            onClose={() => setFeedback(null)}
            variant="filled"
          >
            {feedback?.mensagem}
          </Alert>
        </Snackbar>
      </Container>
    </ProtectedRoute>
  );
} 