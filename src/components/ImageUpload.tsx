'use client';

import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImageUrl?: string;
}

export function ImageUpload({ onImageUpload, currentImageUrl }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Criar FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');

      // Fazer upload para o Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      onImageUpload(data.secure_url);
    } catch (err) {
      setError('Erro ao fazer upload da imagem. Por favor, tente novamente.');
      console.error('Erro no upload:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box>
      {currentImageUrl && (
        <Box mb={2} position="relative" width={200} height={200}>
          <Image
            src={currentImageUrl}
            alt="Imagem atual"
            fill
            style={{ objectFit: 'cover' }}
          />
        </Box>
      )}

      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleUpload}
        disabled={isUploading}
      />
      
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={isUploading}
        >
          {isUploading ? 'Enviando...' : 'Escolher Imagem'}
        </Button>
      </label>

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
} 