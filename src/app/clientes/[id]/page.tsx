'use client';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid,
  IconButton,
  Divider,
  Card,
  CardContent,
  Button,
  Chip,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import { useRouter } from 'next/navigation';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  localTrabalho: string;
  pacoteInicial: number;
  quantidadeRestante: number;
  historico: {
    data: string;
    quantidade: number;
    refeicao: string;
  }[];
}

export default function DetalhesCliente({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    // Simular carregamento de dados do cliente
    // Em um caso real, isso seria uma chamada à API
    const clienteMock: Cliente = {
      id: parseInt(params.id),
      nome: "João Silva",
      email: "joao.silva@email.com",
      telefone: "(11) 98765-4321",
      localTrabalho: "Empresa XYZ - Rua Principal, 123",
      pacoteInicial: 10,
      quantidadeRestante: 8,
      historico: [
        { data: "2024-03-15", quantidade: 1, refeicao: "Quentinha Tradicional" },
        { data: "2024-03-14", quantidade: 1, refeicao: "Quentinha Fit" },
      ]
    };
    setCliente(clienteMock);
  }, [params.id]);

  if (!cliente) {
    return <Box>Carregando...</Box>;
  }

  const getStatusColor = (quantidade: number) => {
    if (quantidade <= 3) return 'error';
    if (quantidade <= 5) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
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
              Detalhes do Cliente
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Informações Principais */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {cliente.nome}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="action" />
                      <Typography>{cliente.email}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="action" />
                      <Typography>{cliente.telefone}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="action" />
                      <Typography>{cliente.localTrabalho}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Status do Pacote */}
            <Grid item xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status do Pacote
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Pacote Inicial
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      {cliente.pacoteInicial}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quentinhas Restantes
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Typography variant="h4">
                        {cliente.quantidadeRestante}
                      </Typography>
                      <Chip
                        label={cliente.quantidadeRestante <= 3 ? 'Crítico' : 
                               cliente.quantidadeRestante <= 5 ? 'Atenção' : 'Normal'}
                        color={getStatusColor(cliente.quantidadeRestante)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Histórico de Consumo */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HistoryIcon color="action" />
                  <Typography variant="h6">
                    Histórico de Consumo
                  </Typography>
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Data</th>
                        <th style={{ textAlign: 'left', padding: '12px' }}>Refeição</th>
                        <th style={{ textAlign: 'center', padding: '12px' }}>Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cliente.historico.map((item, index) => (
                        <tr key={index}>
                          <td style={{ padding: '12px' }}>
                            {new Date(item.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td style={{ padding: '12px' }}>{item.refeicao}</td>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            {item.quantidade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              }}
            >
              Registrar Consumo
            </Button>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              Editar Cliente
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
} 