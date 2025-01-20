'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { usuarioService } from '@/lib/supabase/services';
import { Usuario } from '@/lib/supabase/types';

export default function EditarClientePage() {
  const router = useRouter();
  const { id } = useParams();
  const { usuario } = useAuth();
  const [cliente, setCliente] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error', mensagem: string } | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  useEffect(() => {
    if (id) {
      carregarCliente();
    }
  }, [id]);

  const carregarCliente = async () => {
    try {
      setLoading(true);
      const data = await usuarioService.buscarPorId(id as string);
      if (!data) {
        throw new Error('Cliente não encontrado');
      }
      setCliente(data);
      setFormData({
        nome: data.nome || '',
        email: data.email || '',
        telefone: data.telefone || '',
        endereco: data.endereco || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSalvando(true);
      await usuarioService.atualizar(id as string, {
        ...formData,
        perfil: cliente?.perfil || 'cliente'
      });

      setFeedback({
        tipo: 'success',
        mensagem: 'Cliente atualizado com sucesso!'
      });

      // Aguarda um pouco para mostrar o feedback antes de redirecionar
      setTimeout(() => {
        router.push(`/clientes/${id}`);
      }, 1500);
    } catch (err) {
      setFeedback({
        tipo: 'error',
        mensagem: err instanceof Error ? err.message : 'Erro ao atualizar cliente'
      });
    } finally {
      setSalvando(false);
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/clientes/${id}`)}
            >
              Voltar
            </Button>
            <Typography variant="h4" component="h1">
              Editar Cliente
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                fullWidth
                placeholder="(00) 00000-0000"
              />

              <TextField
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push(`/clientes/${id}`)}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>

        <Snackbar
          open={!!feedback}
          autoHideDuration={3000}
          onClose={() => setFeedback(null)}
        >
          <Alert 
            severity={feedback?.tipo || 'info'} 
            onClose={() => setFeedback(null)}
          >
            {feedback?.mensagem}
          </Alert>
        </Snackbar>
      </Container>
    </ProtectedRoute>
  );
} 