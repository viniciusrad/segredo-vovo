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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import InventoryIcon from "@mui/icons-material/Inventory";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { refeicaoService, pedidoService } from "@/lib/supabase/services";
import { Refeicao, Usuario, Pedido } from "@/lib/supabase/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { usuarioService } from "@/lib/supabase/services/usuarioService";
import { HistoricoPedidos } from '@/components/HistoricoPedidos';
import { HistoricoAquisicoes } from '@/components/HistoricoAquisicoes';
import { ClientesAtivos } from '@/components/ClientesAtivos';
import { BotoesAcao } from '@/components/BotoesAcao';

export default function Home() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [pedidosDoDia, setPedidosDoDia] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorClientes, setErrorClientes] = useState<string | null>(null);
  const [errorPedidos, setErrorPedidos] = useState<string | null>(null);

  useEffect(() => {
    carregarRefeicoes();
  }, []);

  useEffect(() => {
    if (usuario?.perfil === "admin") {
      carregarClientes();
      carregarPedidosDoDia();
    }
  }, [usuario?.perfil]);

  const carregarRefeicoes = async () => {
    try {
      const data = await refeicaoService.listarTodas();
      // Filtra apenas refeições com quantidade disponível
      const refeicoesDisponiveis = data.filter(
        (refeicao) => refeicao.quantidade_disponivel > 0
      );
      setRefeicoes(refeicoesDisponiveis);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar refeições"
      );
    } finally {
      setLoading(false);
    }
  };

  const carregarClientes = async () => {
    try {
      const usuarios = await usuarioService.listarTodos();
      const clientesAtivos = usuarios.filter((u) => u.perfil === "cliente");
      setClientes(clientesAtivos);
    } catch (err) {
      setErrorClientes(
        err instanceof Error ? err.message : "Erro ao carregar clientes"
      );
    } finally {
      setLoadingClientes(false);
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

          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ mb: 3, fontWeight: "bold", color: "#000" }}
            >
              Cardápio do Dia
            </Typography>
            {loading ? (
              <Typography>Carregando refeições...</Typography>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : refeicoes.length === 0 ? (
              <Alert severity="info">
                Nenhuma refeição disponível no momento.
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
                            R$ {refeicao.preco.toFixed(2)}
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
                              label={
                                refeicao.disponivel
                                  ? "Disponível"
                                  : "Indisponível"
                              }
                              color={refeicao.disponivel ? "success" : "error"}
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {refeicao.quantidade_disponivel} unidades
                              disponíveis
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
          <BotoesAcao />

          {usuario?.perfil === 'admin' && (
            <Box mt={4}>
              <ClientesAtivos />
            </Box>
          )}

          {usuario?.perfil === 'cliente' && (
            <Box mt={4}>
              <HistoricoPedidos />
              <HistoricoAquisicoes />
            </Box>
          )}


          {usuario?.perfil === "admin" && (
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ mb: 3, fontWeight: "bold", color: "#000" }}
              >
                Clientes Ativos
              </Typography>
              {loadingClientes ? (
                <Typography>Carregando clientes...</Typography>
              ) : errorClientes ? (
                <Alert severity="error">{errorClientes}</Alert>
              ) : (
                <TableContainer component={Paper} elevation={3}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell>Nome</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {clientes.map((cliente) => (
                        <TableRow
                          key={cliente.id}
                          hover
                          onClick={() => router.push(`/clientes/${cliente.id}`)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <TableCell>{cliente.nome}</TableCell>
                          <TableCell>{cliente.email}</TableCell>
                          <TableCell align="center">
                            <Chip label="Ativo" color="success" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation(); // Evita que o clique no botão propague para a linha
                                router.push(`/clientes/${cliente.id}`);
                              }}
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
          {usuario?.perfil === "admin" && (
            <Box
              sx={{ display: "flex", gap: 3, justifyContent: "center", mt: 4 }}
            >
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => router.push("/refeicoes/cadastro")}
                sx={{
                  background:
                    "linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)",
                  boxShadow: "0 3px 5px 2px rgba(255, 152, 0, .3)",
                  padding: "12px 24px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #FF8C00 30%, #FFA726 90%)",
                  },
                }}
              >
                Nova Refeição
              </Button>
              <Button
                variant="contained"
                startIcon={<InventoryIcon />}
                onClick={() => router.push("/refeicoes/gerenciar")}
                sx={{
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  boxShadow: "0 3px 5px 2px rgba(33, 150, 243, .3)",
                  padding: "12px 24px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #1E88E5 30%, #1CB5E0 90%)",
                  },
                }}
              >
                Gerenciar Refeições
              </Button>
              <Button
                variant="contained"
                startIcon={<RestaurantIcon />}
                sx={{
                  background:
                    "linear-gradient(45deg, #4CAF50 30%, #81C784 90%)",
                  boxShadow: "0 3px 5px 2px rgba(76, 175, 80, .3)",
                  padding: "12px 24px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    background:
                      "linear-gradient(45deg, #43A047 30%, #66BB6A 90%)",
                  },
                }}
              >
                Registrar Consumo
              </Button>
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
