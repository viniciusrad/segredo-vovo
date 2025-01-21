'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  TextField,
  Alert,
  Link as MuiLink,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { authService } from '@/lib/supabase/services/authService';
import { PerfilUsuario } from '@/lib/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface FormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  perfil: PerfilUsuario;
  telefone: string;
}

const perfis: { value: PerfilUsuario; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'atendente', label: 'Atendente' },
  { value: 'cliente', label: 'Cliente' }
];

export default function CadastroPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    perfil: 'cliente',
    telefone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await authService.cadastrar({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        perfil: formData.perfil,
        telefone: formData.telefone
      });

      // Após cadastrar, fazer login automaticamente
      await login(formData.email, formData.senha);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer cadastro');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Cadastro
          </Typography>

          <Typography variant="body1" color="text.secondary" align="center">
            Crie sua conta para acessar o sistema
          </Typography>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

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

          <TextField
            fullWidth
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleInputChange}
            placeholder="(00) 00000-0000"
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleInputChange}
            required
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Confirmar Senha"
            name="confirmarSenha"
            type="password"
            value={formData.confirmarSenha}
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
              {perfis.map((perfil) => (perfil.value != "admin" && (
                <MenuItem key={perfil.value} value={perfil.value}>
                  {perfil.label}
                </MenuItem>
              )))}
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
            }}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Já tem uma conta?{' '}
              <MuiLink component={Link} href="/login">
                Faça login
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 