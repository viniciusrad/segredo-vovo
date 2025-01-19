'use client';
import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Chip, Alert } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import InventoryIcon from '@mui/icons-material/Inventory';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';
import { refeicaoService } from '@/lib/supabase/services';
import { Refeicao, Usuario } from '@/lib/supabase/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { usuarioService } from '@/lib/supabase/services/usuarioService';

export default function Home() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);

  useEffect(() => {
    const carregarRefeicoes = async () => {
      try {
        const data = await refeicaoService.listarTodas();
        setRefeicoes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar refeições');
      } finally {
        setLoading(false);
      }
    };

    carregarRefeicoes();
  }, []);

  useEffect(() => {
    const carregarClientes = async () => {
      if (usuario?.perfil === 'admin') {
        try {
          const usuarios = await usuarioService.listarTodos();
          const clientesAtivos = usuarios.filter(u => u.perfil === 'cliente');
          setClientes(clientesAtivos);
        } catch (err) {
          setErrorClientes(err instanceof Error ? err.message : 'Erro ao carregar clientes');
        } finally {
          setLoadingClientes(false);
        }
      }
    };

    carregarClientes();
  }, [usuario?.perfil]);

  return (
    <ProtectedRoute>
      <Box className={styles.gradientBackground}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              mb: 4
            }}
          >
            Sistema de Controle de Quentinhas
          </Typography>

          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
              Cardápio do Dia
            </Typography>
            {loading ? (
              <Typography>Carregando refeições...</Typography>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Grid container spacing={3}>
                {refeicoes.map((refeicao) => (
                  <Grid item xs={12} sm={6} md={4} key={refeicao.id}>
                    <Card
                      elevation={3}
                      onClick={() => router.push(`/refeicoes/${refeicao.id}`)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        },
                        background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)'
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {refeicao.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {refeicao.descricao}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary">
                            R$ {refeicao.preco.toFixed(2)}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                            <Chip
                              label={refeicao.disponivel ? "Disponível" : "Indisponível"}
                              color={refeicao.disponivel ? "success" : "error"}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {refeicao.quantidade_disponivel} unidades disponíveis
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {usuario?.perfil === 'admin' && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                Clientes Ativos
              </Typography>
              {loadingClientes ? (
                <Typography>Carregando clientes...</Typography>
              ) : errorClientes ? (
                <Alert severity="error">{errorClientes}</Alert>
              ) : (
                <TableContainer component={Paper} elevation={3}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Nome</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clientes.map((cliente) => (
                        <TableRow
                          key={cliente.id}
                          hover
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)'
                            }
                          }}
                        >
                          <TableCell>{cliente.nome}</TableCell>
                          <TableCell>{cliente.email}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label="Ativo"
                              color="success"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => router.push(`/clientes/${cliente.id}`)}
                            >
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
          {usuario?.perfil === 'admin' && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => router.push('/refeicoes/cadastro')}
                sx={{
                  background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
                  boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
                }}
              >
                Nova Refeição
              </Button>
              <Button
                variant="contained"
                startIcon={<InventoryIcon />}
                onClick={() => router.push('/refeicoes/gerenciar')}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                }}
              >
                Gerenciar Refeições
              </Button>
              <Button
                variant="contained"
                startIcon={<RestaurantIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                  boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
                }}
              >
                Registrar Consumo
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
