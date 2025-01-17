'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  Chip,
  Autocomplete
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { refeicaoService } from '@/lib/supabase/services';
import { Refeicao } from '@/lib/supabase/types';

export default function CadastroRefeicao() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refeicao, setRefeicao] = useState<Omit<Refeicao, 'id' | 'created_at' | 'updated_at'>>({
    nome: '',
    descricao: '',
    preco: 0,
    disponivel: true,
    imagem_url: '',
    ingredientes: []
  });
  const [ingredienteInput, setIngredienteInput] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRefeicao(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleAddIngrediente = () => {
    const trimmed = ingredienteInput.trim();
    if (trimmed && !refeicao.ingredientes.includes(trimmed)) {
      setRefeicao(prev => ({
        ...prev,
        ingredientes: [...prev.ingredientes, trimmed]
      }));
      setIngredienteInput('');
    }
  };

  const handleDeleteIngrediente = (ingredienteToDelete: string) => {
    setRefeicao(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.filter(ing => ing !== ingredienteToDelete)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await refeicaoService.criar(refeicao);
      setSuccess(true);
      // Limpar o formulário
      setRefeicao({
        nome: '',
        descricao: '',
        preco: 0,
        disponivel: true,
        imagem_url: '',
        ingredientes: []
      });
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/refeicoes');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar refeição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        component="form" 
        onSubmit={handleSubmit}
        elevation={3}
        sx={{ p: 4 }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Cadastro de Refeição
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Nome do Prato"
            name="nome"
            value={refeicao.nome}
            onChange={handleInputChange}
            required
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Descrição"
            name="descricao"
            value={refeicao.descricao}
            onChange={handleInputChange}
            required
            multiline
            rows={4}
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Preço"
            name="preco"
            type="number"
            value={refeicao.preco}
            onChange={handleInputChange}
            required
            variant="outlined"
            inputProps={{ 
              step: "0.01",
              min: "0" 
            }}
          />

          <TextField
            fullWidth
            label="URL da Imagem"
            name="imagem_url"
            value={refeicao.imagem_url}
            onChange={handleInputChange}
            variant="outlined"
          />

          <Autocomplete
            freeSolo
            options={[]}
            value={ingredienteInput}
            onInputChange={(event, newInputValue) => {
              setIngredienteInput(newInputValue);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAddIngrediente();
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Adicionar Ingrediente"
                variant="outlined"
                onBlur={handleAddIngrediente}
              />
            )}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {refeicao.ingredientes.map((ing, index) => (
              <Chip
                key={index}
                label={ing}
                onDelete={() => handleDeleteIngrediente(ing)}
                color="primary"
              />
            ))}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={refeicao.disponivel}
                onChange={handleInputChange}
                name="disponivel"
                color="primary"
              />
            }
            label="Disponível para Pedidos"
          />

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
              {loading ? 'Salvando...' : 'Salvar Refeição'}
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
          Refeição cadastrada com sucesso!
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
  );
} 