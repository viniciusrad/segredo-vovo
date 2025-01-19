'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { Refeicao } from '@/lib/supabase/types';
import { refeicaoService } from '@/lib/supabase/services';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import InfoIcon from '@mui/icons-material/Info';
import UpdateIcon from '@mui/icons-material/Update';

export default function DetalhesRefeicaoPage() {
  const params = useParams();
  const router = useRouter();
  const [refeicao, setRefeicao] = useState<Refeicao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [atualizandoQuantidade, setAtualizandoQuantidade] = useState(false);

  const { usuario } = useAuth();

  console.log(usuario);

  const carregarRefeicao = async () => {
    try {
      if (!params.id) {
        throw new Error('ID da refeição não fornecido');
      }
      const data = await refeicaoService.buscarPorId(params.id as string);
      if (!data) {
        throw new Error('Refeição não encontrada');
      }
      setRefeicao(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar refeição');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRefeicao();
  }, [params.id]);

  const verificarQuantidade = async () => {
    setAtualizandoQuantidade(true);
    try {
      await carregarRefeicao();
    } finally {
      setAtualizandoQuantidade(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => router.back()}>
          Voltar
        </Button>
      </Container>
    );
  }

  if (!refeicao) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Refeição não encontrada</Alert>
        <Button sx={{ mt: 2 }} onClick={() => router.back()}>
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Imagem da Refeição */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 300,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'grey.100'
              }}
            >
              {refeicao.imagem_url ? (
                <Image
                  src={refeicao.imagem_url}
                  alt={refeicao.nome}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography color="text.secondary">
                    Imagem não disponível
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Informações da Refeição */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {refeicao.nome}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  R$ {refeicao.preco.toFixed(2)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Descrição
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {refeicao.descricao}
                </Typography>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>
                  Ingredientes
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {refeicao.ingredientes?.map((ingrediente, index) => (
                    <Chip
                      key={index}
                      label={ingrediente}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    label={refeicao.disponivel ? 'Disponível' : 'Indisponível'}
                    color={refeicao.disponivel ? 'success' : 'error'}
                  />
                  {refeicao.disponivel && (
                    <>
                      <Chip
                        label={`${refeicao.quantidade_disponivel} unidades disponíveis`}
                        color="primary"
                        variant="outlined"
                      />
                      <Tooltip title="Os números podem mudar rapidamente. Clique para atualizar.">
                        <IconButton
                          size="small"
                          onClick={verificarQuantidade}
                          disabled={atualizandoQuantidade}
                        >
                          <UpdateIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Stack>
                {refeicao.disponivel && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    * A quantidade disponível pode mudar rapidamente
                  </Typography>
                )}
              </Box>
                  
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => router.back()}>
                  Voltar
                </Button>
                {usuario?.perfil === 'admin' ? (
                  <Button
                    variant="contained"
                    onClick={() => router.push(`/refeicoes/${refeicao.id}/editar`)}
                  >
                    Editar Refeição
                  </Button>
                ) : refeicao.disponivel && refeicao.quantidade_disponivel > 0 ? (
                  <Button
                    variant="contained"
                    onClick={() => router.push(`/refeicoes/${refeicao.id}/reserva`)}
                    startIcon={<InfoIcon />}
                  >
                    Reservar Refeição
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    disabled
                  >
                    Indisponível para Reserva
                  </Button>
                )}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Quantidade Disponível</DialogTitle>
        <DialogContent>
          <Typography>
            Atualmente há {refeicao?.quantidade_disponivel} unidades disponíveis.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            * Este número pode mudar rapidamente conforme outros clientes fazem reservas
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fechar</Button>
          <Button onClick={verificarQuantidade} disabled={atualizandoQuantidade}>
            Atualizar Quantidade
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 