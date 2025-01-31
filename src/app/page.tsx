"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  Alert,
  CardMedia,
  Tabs,
  Tab
} from "@mui/material";
// import RestaurantIcon from "@mui/icons-material/Restaurant";
// import InventoryIcon from "@mui/icons-material/Inventory";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { refeicaoService, pedidoService, pontoVendaService } from "@/lib/supabase/services";
import { Refeicao, Pedido, PontoVenda } from "@/lib/supabase/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { HistoricoPedidos } from '@/components/HistoricoPedidos';
import { HistoricoAquisicoes } from '@/components/HistoricoAquisicoes';
import { BotoesAcao } from '@/components/BotoesAcao';
import { formatarPreco } from '@/utils/formatters';
import { useCarrinho } from '@/contexts/CarrinhoContext';
import Image from 'next/image';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ponto-venda-tabpanel-${index}`}
      aria-labelledby={`ponto-venda-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { adicionarItem } = useCarrinho();
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [pedidosDoDia, setPedidosDoDia] = useState<Pedido[]>([]);
  const [pontosVenda, setPontosVenda] = useState<PontoVenda[]>([]);
  const [pontoVendaSelecionado, setPontoVendaSelecionado] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorPedidos, setErrorPedidos] = useState<string | null>(null);
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});
  const [tabAtual, setTabAtual] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!usuario) return;

    const inicializarPontoVenda = async () => {
      try {
        if (usuario.perfil === 'admin') {
          const data = await pontoVendaService.listarTodos();
          setPontosVenda(data);
          if (data.length > 0) {
            setPontoVendaSelecionado(data[0].id);
          }
        } else {
          const pontoVenda = await pontoVendaService.buscarPorUsuario(usuario.id);
          if (pontoVenda) {
            setPontosVenda([pontoVenda]);
            setPontoVendaSelecionado(pontoVenda.id);
          } else {
            setError('Você não está vinculado a nenhum ponto de venda.');
          }
        }
      } catch (err) {
        console.error('Erro ao inicializar ponto de venda:', err);
        setError('Não foi possível carregar as informações do ponto de venda.');
      }
    };

    inicializarPontoVenda();
  }, [usuario]);

  useEffect(() => {
    if (pontoVendaSelecionado) {
      carregarRefeicoes();
    }
  }, [pontoVendaSelecionado]);

  useEffect(() => {
    if (usuario?.perfil === "admin") {
      carregarPedidosDoDia();
    }
  }, [usuario?.perfil]);

  const carregarPontosVenda = async () => {
    try {
      const data = await pontoVendaService.listarTodos();
      console.log('Pontos de venda carregados:', data);
      setPontosVenda(data);
      if (data.length > 0) {
        setPontoVendaSelecionado(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar pontos de venda:', err);
      setError('Não foi possível carregar os pontos de venda.');
    }
  };

  const carregarRefeicoes = async () => {
    try {
      setLoading(true);
      if (!pontoVendaSelecionado) {
        setError('Selecione um ponto de venda para ver o cardápio.');
        return;
      }

      console.log('Carregando refeições para o ponto de venda:', pontoVendaSelecionado);
      const data = await refeicaoService.listarTodas(pontoVendaSelecionado);
      console.log('Refeições carregadas:', data);
      setRefeicoes(data);
      
      const quantidadesIniciais = data.reduce((acc, refeicao) => ({
        ...acc,
        [refeicao.id]: 1
      }), {});
      setQuantidades(quantidadesIniciais);
    } catch (err) {
      console.error('Erro ao carregar refeições:', err);
      setError('Não foi possível carregar o cardápio. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const carregarPedidosDoDia = async () => {
    try {
      const pedidos = await pedidoService.listarTodos();
      console.log(pedidos);
      // Filtra apenas os pedidos do dia atual
      const hoje = new Date().toISOString().split("T")[0];
      const pedidosHoje = pedidos.filter(
        (pedido) => pedido.data_pedido.split("T")[0] === hoje
      );
      setPedidosDoDia(pedidosHoje);
    } catch (err) {
      setErrorPedidos(
        err instanceof Error ? err.message : "Erro ao carregar pedidos"
      );
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleQuantidadeChange = (id: string, quantidade: number) => {
    setQuantidades(prev => ({
      ...prev,
      [id]: quantidade
    }));
  };

  const handleAdicionarAoCarrinho = (refeicao: Refeicao) => {
    const estoquePontoVenda = refeicao.estoque?.find(
      e => e.id_ponto_venda === pontoVendaSelecionado
    );

    if (!estoquePontoVenda) {
      console.error('Estoque não encontrado para o ponto de venda');
      return;
    }

    const quantidade = quantidades[refeicao.id] || 1;
    
    if (quantidade > estoquePontoVenda.quantidade_disponivel) {
      setError(`Quantidade solicitada maior que a disponível (${estoquePontoVenda.quantidade_disponivel})`);
      return;
    }

    adicionarItem({
      id: refeicao.id,
      nome: refeicao.nome,
      preco: refeicao.preco,
      quantidade: quantidade
    });

    setQuantidades(prev => ({
      ...prev,
      [refeicao.id]: 1
    }));
  };

  const getQuantidadeDisponivel = (refeicao: Refeicao) => {
    const estoquePontoVenda = refeicao.estoque?.find(
      e => e.id_ponto_venda === pontoVendaSelecionado
    );
    return estoquePontoVenda?.quantidade_disponivel || 0;
  };

  const getPontoVendaNome = () => {
    console.log('Estado atual:', {
      pontoVendaSelecionado,
      pontosVenda,
      usuarioId: usuario?.id,
      usuarioPerfil: usuario?.perfil
    });
    
    const pontoVenda = pontosVenda.find(pv => pv.id === pontoVendaSelecionado);
    console.log('Ponto de venda encontrado:', pontoVenda);
    
    return pontoVenda?.nome || 'Ponto de venda não identificado';
  };

  const getRefeicoesPontoVenda = (pontoVendaId: string) => {
    return refeicoes.filter(refeicao => {
      const estoquePontoVenda = refeicao.estoque?.find(
        e => e.id_ponto_venda === pontoVendaId
      );
      return estoquePontoVenda?.disponivel;
    });
  };

  // const renderCardapio = (pontoVendaId: string) => {
  //   const refeicoesDoPonto = getRefeicoesPontoVenda(pontoVendaId);

  //   return (
  //     <>

  //     <span>{loading&&"carregando"}</span>
  //       {refeicoesDoPonto.length === 0 ? (
  //         <Alert severity="info">
  //           Não há refeições disponíveis no momento.
  //         </Alert>
  //       ) : (
  //         <Grid container spacing={3}>
  //           {refeicoesDoPonto.map((refeicao) => (
  //             <Grid item xs={12} sm={6} md={4} key={refeicao.id}>
  //               <Card
  //                 elevation={3}
  //                 onClick={() => router.push(`/refeicoes/${refeicao.id}`)}
  //                 sx={{
  //                   height: "100%",
  //                   display: "flex",
  //                   flexDirection: "column",
  //                   transition: "transform 0.2s, box-shadow 0.2s",
  //                   cursor: "pointer",
  //                   "&:hover": {
  //                     transform: "translateY(-4px)",
  //                     boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
  //                   },
  //                   background:
  //                     "linear-gradient(to bottom right, #ffffff, #f8f9fa)",
  //                 }}
  //               >
  //                 {refeicao.imagem_url && (
  //                   <CardMedia
  //                     component="div"
  //                     sx={{ position: 'relative', height: 200 }}
  //                   >
  //                     <Image
  //                       src={refeicao.imagem_url}
  //                       alt={refeicao.nome}
  //                       fill
  //                       style={{ objectFit: 'cover' }}
  //                     />
  //                   </CardMedia>
  //                 )}
  //                 <CardContent>
  //                   <Typography variant="h6" component="h3" gutterBottom>
  //                     {refeicao.nome}
  //                   </Typography>
  //                   <Typography
  //                     variant="body2"
  //                     color="text.secondary"
  //                     sx={{ mb: 2 }}
  //                   >
  //                     {refeicao.descricao}
  //                   </Typography>
  //                   <Box
  //                     sx={{
  //                       display: "flex",
  //                       justifyContent: "space-between",
  //                       alignItems: "center",
  //                     }}
  //                   >
  //                     <Typography variant="h6" color="primary">
  //                       {formatarPreco(refeicao.preco)}
  //                     </Typography>
  //                     <Box
  //                       sx={{
  //                         display: "flex",
  //                         flexDirection: "column",
  //                         alignItems: "flex-end",
  //                         gap: 1,
  //                       }}
  //                     >
  //                       <Chip
  //                         label={`${getQuantidadeDisponivel(refeicao)} disponíveis`}
  //                         color={getQuantidadeDisponivel(refeicao) > 0 ? "success" : "error"}
  //                         size="small"
  //                       />
  //                     </Box>
  //                   </Box>
  //                 </CardContent>
  //               </Card>
  //             </Grid>
  //           ))}
  //         </Grid>
  //       )}
  //     </>
  //   );
  // };

  if (!usuario) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Faça login para ver o cardápio e fazer pedidos.
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute>
      <Box className={styles.gradientBackground}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              backgroundClip: "text",
              textFillColor: "transparent",
              mb: 4,
            }}
          >
            Segedo da Vovó
          </Typography>

          <Typography variant="h4" component="h1" gutterBottom>
            Bem-vindo, {usuario?.nome}!
          </Typography>
          <Typography variant="h3" component="h3" sx={{ 
            fontSize: '1.5rem',
            color: 'text.secondary',
            fontWeight: 'normal',
            mb: 3
          }}>
            {getPontoVendaNome()}
          </Typography>

          {usuario?.perfil === 'admin' ? (
            <Box sx={{ width: '100%', mb: 4 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabAtual}
                  onChange={(_, newValue) => {
                    setTabAtual(newValue);
                    const pontoVenda = pontosVenda[newValue];
                    if (pontoVenda) {
                      setPontoVendaSelecionado(pontoVenda.id);
                    }
                  }}
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons={isMobile ? "auto" : false}
                  aria-label="Pontos de Venda"
                >
                  {pontosVenda.map((pv, index) => (
                    <Tab
                      key={pv.id}
                      label={pv.nome}
                      id={`ponto-venda-tab-${index}`}
                      aria-controls={`ponto-venda-tabpanel-${index}`}
                    />
                  ))}
                </Tabs>
              </Box>

              {pontosVenda.map((pontoVenda, index) => {
                const refeicoesDoPonto = getRefeicoesPontoVenda(pontoVenda.id);
                console.log(`Refeições do ponto ${pontoVenda.nome}:`, refeicoesDoPonto);

                return (
                  <TabPanel key={pontoVenda.id} value={tabAtual} index={index}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      Cardápio - {pontoVenda.nome}
                    </Typography>
                    {refeicoesDoPonto.length === 0 ? (
                      <Alert severity="info">
                        Não há refeições disponíveis neste ponto de venda.
                      </Alert>
                    ) : (
                      <Grid container spacing={3}>
                        {refeicoesDoPonto.map((refeicao) => (
                          <Grid item xs={12} sm={6} md={4} key={refeicao.id}>
                            <Card
                              elevation={3}
                              onClick={() => router.push(`/refeicoes/${refeicao.id}`)}
                              sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                cursor: "pointer",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                                },
                                background:
                                  "linear-gradient(to bottom right, #ffffff, #f8f9fa)",
                              }}
                            >
                              {refeicao.imagem_url && (
                                <CardMedia
                                  component="div"
                                  sx={{ position: 'relative', height: 200 }}
        >
          <Image
                                    src={refeicao.imagem_url}
                                    alt={refeicao.nome}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                  />
                                </CardMedia>
                              )}
                              <CardContent>
                                <Typography variant="h6" component="h3" gutterBottom>
                                  {refeicao.nome}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 2 }}
                                >
                                  {refeicao.descricao}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography variant="h6" color="primary">
                                    {formatarPreco(refeicao.preco)}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-end",
                                      gap: 1,
                                    }}
                                  >
                                    <Chip
                                      label={`${getQuantidadeDisponivel(refeicao)} disponíveis`}
                                      color={getQuantidadeDisponivel(refeicao) > 0 ? "success" : "error"}
                                      size="small"
                                    />
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </TabPanel>
                );
              })}
            </Box>
          ) : (
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ mb: 3, fontWeight: "bold", color: "#000" }}
              >
                Cardápio do Dia
              </Typography>
              {refeicoes.length === 0 ? (
                <Alert severity="info">
                  Não há refeições disponíveis no momento.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {refeicoes.map((refeicao) => (
                    <Grid item xs={12} sm={6} md={4} key={refeicao.id}>
                      <Card
                        elevation={3}
                        onClick={() => router.push(`/refeicoes/${refeicao.id}`)}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          cursor: "pointer",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                          },
                          background:
                            "linear-gradient(to bottom right, #ffffff, #f8f9fa)",
                        }}
                      >
                        {refeicao.imagem_url && (
                          <CardMedia
                            component="div"
                            sx={{ position: 'relative', height: 200 }}
        >
          <Image
                              src={refeicao.imagem_url}
                              alt={refeicao.nome}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </CardMedia>
                        )}
                        <CardContent>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {refeicao.nome}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {refeicao.descricao}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="h6" color="primary">
                              {formatarPreco(refeicao.preco)}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 1,
                              }}
                            >
                              <Chip
                                label={`${getQuantidadeDisponivel(refeicao)} disponíveis`}
                                color={getQuantidadeDisponivel(refeicao) > 0 ? "success" : "error"}
                                size="small"
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
          <BotoesAcao />

          {usuario?.perfil === 'cliente' && (
            <Box mt={4}>
              <HistoricoPedidos />
              <HistoricoAquisicoes />
            </Box>
          )}

          {usuario?.perfil === "admin" && (
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ mb: 3, fontWeight: "bold", color: "#000", marginTop: "2rem" }}
              >
                Pedidos do Dia
              </Typography>
              {loadingPedidos ? (
                <Typography>Carregando pedidos...</Typography>
              ) : errorPedidos ? (
                <Alert severity="error">{errorPedidos}</Alert>
              ) : pedidosDoDia.length === 0 ? (
                <Alert severity="info">Nenhum pedido registrado hoje.</Alert>
              ) : (
                <TableContainer component={Paper} elevation={3}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell>Horário</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Refeição</TableCell>
                        <TableCell align="center">Quantidade</TableCell>
                        <TableCell align="center">Valor Total</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pedidosDoDia.map((pedido) => (
                        <TableRow key={pedido.id} hover>
                          <TableCell>
                            {new Date(pedido.data_pedido).toLocaleTimeString(
                              "pt-BR"
                            )}
                          </TableCell>
                          <TableCell>
                            <Box
                              component="span"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/clientes/${pedido.cliente_id}`);
                              }}
                              sx={{
                                cursor: "pointer",
                                color: "primary.main",
                                "&:hover": {
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              {pedido.usuarios?.nome ||
                                "Cliente não encontrado"}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {pedido.refeicoes?.nome ||
                              "Refeição não encontrada"}
                          </TableCell>
                          <TableCell align="center">
                            {pedido.quantidade}
                          </TableCell>
                          <TableCell align="center">
                            R$ {pedido.valor_total.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={pedido.status}
                              color={
                                pedido.status === "entregue"
                                  ? "success"
                                  : pedido.status === "separado"
                                    ? "warning"
                                    : pedido.status === "cancelado"
                                      ? "error"
                                      : "default"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                router.push(`/pedidos/${pedido.id}`)
                              }
                            >
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
