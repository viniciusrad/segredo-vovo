'use client';

import { useRouter } from 'next/navigation';
import { Box, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useAuth } from '@/contexts/AuthContext';

export function BotoesAcao() {
  const router = useRouter();
  const { usuario } = useAuth();

  if (usuario?.perfil !== 'admin') return null;

  return (
    <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 4 }}>
      <Button
        variant="contained"
        startIcon={<AddCircleOutlineIcon />}
        onClick={() => router.push('/refeicoes/cadastro')}
        sx={{
          background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
          boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF8C00 30%, #FFA726 90%)',
          },
        }}
      >
        Nova Refeição
      </Button>

      <Button
        variant="contained"
        startIcon={<InventoryIcon />}
        onClick={() => router.push('/refeicoes/gerenciar')}
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          '&:hover': {
            background: 'linear-gradient(45deg, #1E88E5 30%, #1CB5E0 90%)',
          },
        }}
      >
        Gerenciar Refeições
      </Button>

      <Button
        variant="contained"
        startIcon={<RestaurantIcon />}
        onClick={() => router.push('/pedidos/registrar')}
        sx={{
          background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
          boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          '&:hover': {
            background: 'linear-gradient(45deg, #43A047 30%, #66BB6A 90%)',
          },
        }}
      >
        Registrar Consumo
      </Button>
    </Box>
  );
} 