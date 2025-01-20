'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImageUrl?: string;
}

export function ImageUpload({ onImageUpload, currentImageUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detecta se é um dispositivo móvel
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      onImageUpload(data.secure_url);
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      {currentImageUrl && (
        <Box sx={{ mb: 2, position: 'relative', width: '100%', height: '200px' }}>
          <Image
            src={currentImageUrl}
            alt="Imagem atual"
            fill
            style={{ objectFit: 'cover' }}
          />
        </Box>
      )}

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          component="label"
          variant="outlined"
          startIcon={!uploading && <CloudUploadIcon />}
          disabled={uploading}
          sx={{ 
            flex: 1,
            height: !currentImageUrl ? '200px' : 'auto',
            border: '2px dashed',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            '&:hover': {
              border: '2px dashed',
            }
          }}
        >
          {uploading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleUpload}
              />
              <Typography>
                {currentImageUrl ? 'Alterar imagem' : 'Fazer upload de imagem'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Arraste uma imagem ou clique para selecionar
              </Typography>
            </>
          )}
        </Button>

        {isMobile && (
          <Button
            component="label"
            variant="outlined"
            startIcon={<CameraAltIcon />}
            sx={{ flex: 1 }}
          >
            <input
              type="file"
              hidden
              accept="image/*"
              capture="environment"
              onChange={handleUpload}
            />
            Usar Câmera
          </Button>
        )}
      </Stack>

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
} 