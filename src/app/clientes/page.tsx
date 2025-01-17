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
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { Cliente } from '@/lib/supabase/types';
import { clienteService } from '@/lib/supabase/services';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const data = await clienteService.listarTodos();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await clienteService.excluir(id);
        await carregarClientes();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir cliente');
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
              Clientes
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/clientes/cadastro')}
            >
              Novo Cliente
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
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                    <TableCell>{cliente.endereco}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => router.push(`/clientes/${cliente.id}/editar`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleExcluir(cliente.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
} 