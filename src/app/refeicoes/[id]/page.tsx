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
  Stack,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ScaleIcon from '@mui/icons-material/Scale';
import SetMealIcon from '@mui/icons-material/SetMeal';
import { useRouter } from 'next/navigation';

interface InfoNutricional {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
}

interface Refeicao {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  tempoPreparo: string;
  porcao: string;
  infoNutricional: InfoNutricional;
  ingredientesPrincipais: string[];
  restricoes?: string[];
  imagem?: string;
}

export default function DetalhesRefeicao({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [refeicao, setRefeicao] = useState<Refeicao | null>(null);

  useEffect(() => {
    // Simular carregamento de dados da refeição
    const refeicaoMock: Refeicao = {
      id: parseInt(params.id),
      nome: "Quentinha Tradicional",
      descricao: "Uma combinação perfeita de sabores caseiros, preparada com ingredientes frescos e selecionados.",
      preco: 15.0,
      tempoPreparo: "25 minutos",
      porcao: "400g",
      infoNutricional: {
        calorias: 550,
        proteinas: 35,
        carboidratos: 65,
        gorduras: 15,
        fibras: 8
      },
      ingredientesPrincipais: [
        "Arroz branco",
        "Feijão carioca",
        "Frango grelhado",
        "Mix de legumes",
        "Salada fresca"
      ],
      restricoes: ["Contém glúten", "Contém proteína animal"],
      imagem: "/quentinha-tradicional.jpg" // Adicione uma imagem real depois
    };
    setRefeicao(refeicaoMock);
  }, [params.id]);

  if (!refeicao) {
    return <Box>Carregando...</Box>;
  }

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
              Detalhes da Refeição
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Informações Principais */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {refeicao.nome}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  R$ {refeicao.preco.toFixed(2)}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" paragraph>
                  {refeicao.descricao}
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Ingredientes Principais
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {refeicao.ingredientesPrincipais.map((ingrediente, index) => (
                      <Chip 
                        key={index}
                        label={ingrediente}
                        icon={<RestaurantIcon />}
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>

                {refeicao.restricoes && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      Restrições Alimentares
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {refeicao.restricoes.map((restricao, index) => (
                        <Chip 
                          key={index}
                          label={restricao}
                          color="warning"
                          variant="outlined"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Informações Nutricionais */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Informações da Porção
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScaleIcon color="action" />
                      <Typography>Porção: {refeicao.porcao}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SetMealIcon color="action" />
                      <Typography>Tempo de Preparo: {refeicao.tempoPreparo}</Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card elevation={3}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocalFireDepartmentIcon color="action" />
                      <Typography variant="h6">
                        Informações Nutricionais
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Calorias
                        </Typography>
                        <Typography variant="h5">
                          {refeicao.infoNutricional.calorias} kcal
                        </Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Proteínas
                        </Typography>
                        <Typography>{refeicao.infoNutricional.proteinas}g</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Carboidratos
                        </Typography>
                        <Typography>{refeicao.infoNutricional.carboidratos}g</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Gorduras
                        </Typography>
                        <Typography>{refeicao.infoNutricional.gorduras}g</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Fibras
                        </Typography>
                        <Typography>{refeicao.infoNutricional.fibras}g</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
} 