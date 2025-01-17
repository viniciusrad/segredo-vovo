'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { PerfilUsuario } from '@/lib/supabase/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  perfisPermitidos?: PerfilUsuario[];
}

export function ProtectedRoute({ children, perfisPermitidos }: ProtectedRouteProps) {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !usuario) {
      router.push('/login');
    }

    if (!loading && usuario && perfisPermitidos) {
      if (!perfisPermitidos.includes(usuario.perfil)) {
        router.push('/acesso-negado');
      }
    }
  }, [usuario, loading, router, perfisPermitidos]);

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

  if (!usuario) {
    return null;
  }

  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    return null;
  }

  return <>{children}</>;
} 