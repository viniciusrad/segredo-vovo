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
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/navigation';
import { PontoVenda } from '@/lib/supabase/types';
import { pontoVendaService } from '@/lib/supabase/services/pontoVendaService';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function PontosVendaPage() {
  const router = useRouter();
  const [pontosVenda, setPontosVenda] = useState<PontoVenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarPontosVenda();
  }, []);

  const carregarPontosVenda = async () => {
    try {
      const data = await pontoVendaService.listarTodos();
      setPontosVenda(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pontos de venda');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ponto de venda?')) {
      try {
        await pontoVendaService.excluir(id);
        await carregarPontosVenda();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir ponto de venda');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProtectedRoute perfisPermitidos={['admin']}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Pontos de Venda
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/pontos-venda/cadastro')}
            >
              Novo Ponto de Venda
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Nome</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Responsável</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pontosVenda.map((ponto) => (
                  <TableRow key={ponto.id} hover>
                    <TableCell>{ponto.nome}</TableCell>
                    <TableCell>{ponto.endereco}</TableCell>
                    <TableCell>{ponto.responsavel}</TableCell>
                    <TableCell>{ponto.telefone}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={ponto.ativo ? 'Ativo' : 'Inativo'}
                        color={ponto.ativo ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          color="info"
                          onClick={() => router.push(`/pontos-venda/${ponto.id}`)}
                          title="Ver Detalhes"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => router.push(`/pontos-venda/${ponto.id}/editar`)}
                          title="Editar"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleExcluir(ponto.id)}
                          title="Excluir"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {pontosVenda.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhum ponto de venda cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
} 