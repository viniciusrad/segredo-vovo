'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  FormControlLabel,
  Switch
} from '@mui/material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { pontoVendaService } from '@/lib/supabase/services/pontoVendaService';
import { PontoVenda } from '@/lib/supabase/types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useLoading } from '@/contexts/LoadingContext';

export default function CadastroPontoVendaPage() {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  const [formData, setFormData] = useState<Omit<PontoVenda, 'id' | 'created_at' | 'updated_at'>>({
    nome: '',
    endereco: '',
    responsavel: '',
    telefone: '',
    ativo: true
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startLoading();

    try {
      await pontoVendaService.criar(formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/pontos-venda');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar ponto de venda');
    } finally {
      stopLoading();
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              Novo Ponto de Venda
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.back()}
            >
              Voltar
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Ponto de venda cadastrado com sucesso!
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nome do Local"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
              helperText="Nome do estabelecimento ou ponto de venda"
            />

            <TextField
              fullWidth
              label="Endereço"
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
              required
              multiline
              rows={2}
              helperText="Endereço completo do ponto de venda"
            />

            <TextField
              fullWidth
              label="Responsável"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleInputChange}
              required
              helperText="Nome do responsável pelo ponto de venda"
            />

            <TextField
              fullWidth
              label="Telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              required
              helperText="Telefone de contato do ponto de venda"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.ativo}
                  onChange={handleInputChange}
                  name="ativo"
                />
              }
              label="Ponto de Venda Ativo"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
              >
                Salvar
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
} 