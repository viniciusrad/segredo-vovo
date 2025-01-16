import { Box, Container, Typography, Paper, Grid } from '@mui/material';

// interface PageProps {
//   params: {
//     id: string;
//   };
// }

export default async function ClientePage( {params} ) {
  const {id} = await params //(params as PageProps).params.id;

  // Mock de dados do cliente
  const clienteMock = {
    id: id,
    nome: "Nome do Cliente",
    telefone: "(11) 99999-9999",
    endereco: "Rua Exemplo, 123",
    historicoPedidos: [
      {
        id: "1",
        data: "2024-01-01",
        status: "Entregue",
        valor: 50.00
      },
      // Adicione mais pedidos conforme necessário
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes do Cliente
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Informações Pessoais</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Nome:</strong> {clienteMock.nome}</Typography>
              <Typography><strong>Telefone:</strong> {clienteMock.telefone}</Typography>
              <Typography><strong>Endereço:</strong> {clienteMock.endereco}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 3 }}>Histórico de Pedidos</Typography>
            <Box sx={{ mt: 2 }}>
              {clienteMock.historicoPedidos.map((pedido) => (
                <Paper key={pedido.id} sx={{ p: 2, mb: 2 }}>
                  <Typography><strong>Data:</strong> {pedido.data}</Typography>
                  <Typography><strong>Status:</strong> {pedido.status}</Typography>
                  <Typography><strong>Valor:</strong> R$ {pedido.valor.toFixed(2)}</Typography>
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
} 