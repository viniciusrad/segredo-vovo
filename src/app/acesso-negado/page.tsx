'use client';

import { Box, Container, Paper, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import BlockIcon from '@mui/icons-material/Block';

export default function AcessoNegadoPage() {
  const router = useRouter();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3
          }}
        >
          <BlockIcon sx={{ fontSize: 60, color: 'error.main' }} />
          
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Acesso Negado
          </Typography>

          <Typography variant="body1" color="text.secondary" align="center">
            Você não tem permissão para acessar esta página.
            Por favor, entre em contato com o administrador do sistema.
          </Typography>

          <Button
            variant="contained"
            onClick={() => router.push('/')}
            sx={{
              mt: 2,
              backgroundColor: '#ff9800',
              '&:hover': {
                backgroundColor: '#f57c00'
              }
            }}
          >
            Voltar para a Página Inicial
          </Button>
        </Paper>
      </Container>
    </Box>
  );
} 