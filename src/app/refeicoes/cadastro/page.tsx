'use client';
import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  IconButton,
  Paper,
  Stack
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

interface NovaRefeicao {
  nome: string;
  descricao: string;
  foto?: File;
}

export default function CadastroRefeicao() {
  const router = useRouter();
  const [refeicao, setRefeicao] = useState<NovaRefeicao>({
    nome: '',
    descricao: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRefeicao(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefeicao(prev => ({
        ...prev,
        foto: file
      }));
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setRefeicao(prev => {
      const newRefeicao = { ...prev };
      delete newRefeicao.foto;
      return newRefeicao;
    });
    setPreviewUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para salvar a refeição
    console.log('Refeição a ser salva:', refeicao);
    // Após salvar, redirecionar para a página principal
    router.push('/');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        <Stack spacing={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => router.push('/')}
              sx={{ 
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
              }}
            >
              Cadastro de Nova Refeição
            </Typography>
          </Box>

          <Paper 
            component="form" 
            onSubmit={handleSubmit}
            elevation={3}
            sx={{ p: 4 }}
          >
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

              <Card sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Foto da Refeição (Opcional)
                  </Typography>
                  
                  {previewUrl ? (
                    <Box sx={{ position: 'relative', width: 'fit-content' }}>
                      {/* <img 
                        src={previewUrl} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px',
                          borderRadius: '8px'
                        }} 
                      /> */}
                      <IconButton
                        onClick={removeImage}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<AddPhotoAlternateIcon />}
                      sx={{ mt: 1 }}
                    >
                      Escolher Foto
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  Salvar Refeição
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
} 