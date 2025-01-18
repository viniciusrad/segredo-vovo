'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
//import { authService } from '@/lib/supabase/services/authService';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const processarCallback = async () => {
      try {
        // const session = await authService.getSession();
        // if (session) {
        //   await authService.criarOuAtualizarUsuario(session);
        //   router.push('/');
        // } else {
        //   router.push('/login');
        // }
      } catch (error) {
        console.error('Erro no callback:', error);
        router.push('/login');
      }
    };

    processarCallback();
  }, [router]);

  return (
    <Box 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography>
        Processando autenticação...
      </Typography>
    </Box>
  );
} 