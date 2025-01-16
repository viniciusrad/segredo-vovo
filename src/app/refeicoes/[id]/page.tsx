import { Box, Container, Typography, Paper, Grid } from '@mui/material';

// interface PageProps {
//   params: {
//     id: string;
//   };
// }

export default async function RefeicaoPage( {params} ) {
  const {id} = await params//(params as PageProps).params.id;

  // Mock de dados da refeição
  const refeicaoMock = {
    id: id,
    nome: "Quentinha Tradicional",
    descricao: "Arroz, feijão, carne e salada",
    preco: 25.00,
    disponivel: true,
    ingredientes: [
      "Arroz branco",
      "Feijão carioca",
      "Carne bovina",
      "Salada de alface e tomate"
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes da Refeição
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h5">{refeicaoMock.nome}</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>{refeicaoMock.descricao}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Preço: R$ {refeicaoMock.preco.toFixed(2)}</Typography>
              <Typography variant="body2" color={refeicaoMock.disponivel ? "success.main" : "error.main"}>
                {refeicaoMock.disponivel ? "Disponível" : "Indisponível"}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2 }}>Ingredientes</Typography>
            <Box component="ul" sx={{ mt: 1, pl: 3 }}>
              {refeicaoMock.ingredientes.map((ingrediente, index) => (
                <li key={index}>
                  <Typography>{ingrediente}</Typography>
                </li>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 