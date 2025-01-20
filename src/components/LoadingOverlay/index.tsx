'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { Box, CircularProgress, Fade } from '@mui/material';

export function LoadingOverlay() {
  const { isLoading } = useLoading();

  return (
    <Fade in={isLoading} unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(3px)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <CircularProgress
            size={40}
            sx={{
              color: 'primary.main',
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(0.95)',
                  opacity: 0.8,
                },
                '50%': {
                  transform: 'scale(1.05)',
                  opacity: 1,
                },
                '100%': {
                  transform: 'scale(0.95)',
                  opacity: 0.8,
                },
              },
            }}
          />
        </Box>
      </Box>
    </Fade>
  );
} 