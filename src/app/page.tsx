'use client';
import { Box, Card, CardContent, Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Chip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import styles from "./page.module.css";
import { useRouter } from 'next/navigation';

interface Cliente {
  id: number;
  nome: string;
  quantidadeRestante: number;
  pacoteInicial: number;
}

interface ItemCardapio {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
}

export default function Home() {
  const router = useRouter();

  const cardapio: ItemCardapio[] = [
    {
      id: 1,
      nome: "Quentinha Tradicional",
      descricao: "Arroz, feijão, frango grelhado, salada",
      preco: 15.0,
    },
    {
      id: 2,
      nome: "Quentinha Fit",
      descricao: "Arroz integral, legumes, peixe, salada",
      preco: 18.0,
    },
    {
      id: 3,
      nome: "Quentinha Vegetariana",
      descricao: "Arroz, legumes grelhados, proteína vegetal",
      preco: 16.0,
    },
  ];

  const clientes: Cliente[] = [
    { id: 1, nome: "João Silva", quantidadeRestante: 8, pacoteInicial: 10 },
    { id: 2, nome: "Maria Santos", quantidadeRestante: 15, pacoteInicial: 20 },
    { id: 3, nome: "Pedro Oliveira", quantidadeRestante: 3, pacoteInicial: 10 },
  ];

  const getStatusColor = (quantidade: number) => {
    if (quantidade <= 3) return 'error';
    if (quantidade <= 5) return 'warning';
    return 'success';
  };

  const getStatusText = (quantidade: number) => {
    if (quantidade <= 3) return 'Crítico';
    if (quantidade <= 5) return 'Atenção';
    return 'Normal';
  };

  return (
    <Box className={styles.gradientBackground}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            mb: 4
          }}
        >
          Sistema de Controle de Quentinhas
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            Cardápio do Dia
          </Typography>
          <Grid container spacing={3}>
            {cardapio.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  elevation={3}
                  onClick={() => router.push(`/refeicoes/${item.id}`)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                    background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {item.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.descricao}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      R$ {item.preco.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
            Clientes Ativos
          </Typography>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Nome</TableCell>
                  <TableCell align="center">Pacote</TableCell>
                  <TableCell align="center">Restantes</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((cliente, index) => (
                  <TableRow 
                    key={index} 
                    hover 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={() => router.push(`/clientes/${cliente.id}`)}
                  >
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell align="center">{cliente.pacoteInicial}</TableCell>
                    <TableCell align="center">{cliente.quantidadeRestante}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusText(cliente.quantidadeRestante)}
                        color={getStatusColor(cliente.quantidadeRestante)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => router.push('/refeicoes/cadastro')}
            sx={{
              background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
              boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
            }}
          >
            Nova Refeição
          </Button>
          <Button
            variant="contained"
            startIcon={<RestaurantIcon />}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
            }}
          >
            Registrar Consumo
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
