'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Stack,
  Chip
} from '@mui/material';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { refeicaoService } from '@/lib/supabase/services';
import { Refeicao } from '@/lib/supabase/types';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ImageUpload } from '@/components/ImageUpload';

export default function EditarRefeicaoPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [novoIngrediente, setNovoIngrediente] = useState('');
  const [formData, setFormData] = useState<Omit<Refeicao, 'id' | 'created_at' | 'updated_at'>>({
    nome: '',
    descricao: '',
    preco: 0,
    disponivel: true,
    imagem_url: '',
    quantidade_disponivel: 0,
    ingredientes: []
  });

  useEffect(() => {
    if (id) {
      carregarRefeicao();
    }
  }, [id]);

  const carregarRefeicao = async () => {
    try {
      setLoading(true);
      const data = await refeicaoService.buscarPorId(id as string);
      if (!data) {
        throw new Error('Refeição não encontrada');
      }
      setFormData({
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        disponivel: data.disponivel,
        imagem_url: data.imagem_url || '',
        quantidade_disponivel: data.quantidade_disponivel,
        ingredientes: data.ingredientes || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar refeição');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleAddIngrediente = () => {
    if (novoIngrediente.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredientes: [...prev.ingredientes, novoIngrediente.trim()]
      }));
      setNovoIngrediente('');
    }
  };

  const handleRemoveIngrediente = (ingrediente: string) => {
    setFormData(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.filter(i => i !== ingrediente)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setError(null);

    try {
      await refeicaoService.atualizar(id as string, formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/refeicoes/gerenciar');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar refeição');
    } finally {
      setSalvando(false);
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={3}
          sx={{ p: 4 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              Editar Refeição
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
              Refeição atualizada com sucesso!
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nome da Refeição"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              label="Descrição"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              required
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Preço"
              name="preco"
              type="number"
              value={formData.preco}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              fullWidth
              label="Quantidade Disponível"
              name="quantidade_disponivel"
              type="number"
              value={formData.quantidade_disponivel}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0 }}
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Imagem da Refeição
              </Typography>
              <ImageUpload
                onImageUpload={(url) => setFormData(prev => ({ ...prev, imagem_url: url }))}
                currentImageUrl={formData.imagem_url}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Ingredientes
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Novo Ingrediente"
                  value={novoIngrediente}
                  onChange={(e) => setNovoIngrediente(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngrediente();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddIngrediente}
                  disabled={!novoIngrediente.trim()}
                >
                  Adicionar
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.ingredientes.map((ingrediente, index) => (
                  <Chip
                    key={index}
                    label={ingrediente}
                    onDelete={() => handleRemoveIngrediente(ingrediente)}
                  />
                ))}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.disponivel}
                  onChange={handleInputChange}
                  name="disponivel"
                />
              }
              label="Disponível para Venda"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={salvando}
                startIcon={<SaveIcon />}
              >
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </ProtectedRoute>
  );
} 