'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/config';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';

interface Aquisicao {
  id: string;
  cliente_id: string;
  quantidade: number;
  valor_total: number;
  data_aquisicao: string;
  created_at: string;
}

export function HistoricoAquisicoes() {
  const { usuario } = useAuth();
  const [aquisicoes, setAquisicoes] = useState<Aquisicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario?.id) {
      carregarAquisicoes();
    }
  }, [usuario?.id]);

  const carregarAquisicoes = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('aquisicoes_refeicoes')
        .select('*')
        .eq('cliente_id', usuario!.id)
        .order('data_aquisicao', { ascending: false });

      if (err) throw err;
      setAquisicoes(data || []);
    } catch (err) {
      setError('Erro ao carregar histórico de aquisições');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Histórico de Aquisições de Refeições
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell align="center">Quantidade</TableCell>
              <TableCell align="right">Valor Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aquisicoes.map((aquisicao) => (
              <TableRow key={aquisicao.id} hover>
                <TableCell>
                  {new Date(aquisicao.data_aquisicao).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell align="center">{aquisicao.quantidade}</TableCell>
                <TableCell align="right">
                  {aquisicao.valor_total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </TableCell>
              </TableRow>
            ))}
            {aquisicoes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nenhuma aquisição encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 