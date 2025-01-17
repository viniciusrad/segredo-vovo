'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Stack
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PerfilUsuario } from '@/lib/supabase/types';
import { usuarioService } from '@/lib/supabase/services/usuarioService';
import { SelectChangeEvent } from '@mui/material/Select';

interface FormData {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

const perfis: { value: PerfilUsuario; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'atendente', label: 'Atendente' },
  { value: 'cliente', label: 'Cliente' }
];

export default function CadastroUsuarioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    perfil: 'cliente'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<PerfilUsuario>) => {
    setFormData(prev => ({
      ...prev,
      perfil: e.target.value as PerfilUsuario
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await usuarioService.criar(formData);
      setSuccess(true);
      setFormData({
        nome: '',
        email: '',
        perfil: 'cliente'
      });
      setTimeout(() => {
        router.push('/usuarios');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute perfisPermitidos={['admin']}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={3}
          sx={{ p: 4 }}
        >
          <Typography variant="h4" gutterBottom align="center">
            Cadastro de Usuário
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
              variant="outlined"
            />

            <TextField
              fullWidth
              label="E-mail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              variant="outlined"
            />

            <FormControl fullWidth required>
              <InputLabel>Perfil</InputLabel>
              <Select
                name="perfil"
                value={formData.perfil}
                label="Perfil"
                onChange={handleSelectChange}
              >
                {perfis.map((perfil) => (
                  <MenuItem key={perfil.value} value={perfil.value}>
                    {perfil.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Usuário cadastrado com sucesso!
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ProtectedRoute>
  );
} 