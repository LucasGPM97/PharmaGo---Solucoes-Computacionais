import express from "express";
import { syncDatabase } from "./models";
import clienteRoutes from "./routes/clienteRoutes";
import enderecoClienteRoutes from "./routes/enderecoClienteRoutes";
import enderecoEstabelecimentoRoutes from "./routes/enderecoEstabelecimentoRoutes";
import formaPagamentoRoutes from "./routes/formaPagamentoRoutes";
import estabelecimentoRoutes from "./routes/estabelecimentoRoutes";
import produtoRoutes from "./routes/produtoRoutes";
import pedidoRoutes from "./routes/pedidoRoutes";
import receitaMedicaRoutes from "./routes/receitaMedicaRoutes";
import carrinhoRoutes from "./routes/carrinhoRoutes";
import authRoutes from "./routes/authRoutes";
import catalogoProdutoRoutes from "./routes/catalogoProdutoRoutes";
import uploadRoutes from "./routes/uploadRoutes"; // Importar as rotas de upload
import authMiddleware from "./middlewares/authMiddleware";
import horarioFuncionamentoRoutes from "./routes/horarioFuncionamentoRoutes";
import path from "path";

const app = express();

app.use(express.json());

// Servir arquivos estáticos da pasta 'public/uploads'
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Rotas de autenticação (não protegidas)
app.use("/auth", authRoutes);

// Rotas de upload (protegidas)
app.use("/upload", authMiddleware, uploadRoutes); // Adicionar as rotas de upload

// Rotas protegidas por autenticação
app.use("/clientes", authMiddleware, clienteRoutes);
app.use("/enderecos_cliente", authMiddleware, enderecoClienteRoutes);
app.use(
  "/enderecos_estabelecimento",
  authMiddleware,
  enderecoEstabelecimentoRoutes
);
app.use("/formas-pagamento", authMiddleware, formaPagamentoRoutes);
app.use("/estabelecimentos", authMiddleware, estabelecimentoRoutes);
app.use("/produtos", authMiddleware, produtoRoutes);
app.use("/catalogo-produtos", authMiddleware, catalogoProdutoRoutes);
app.use("/pedidos", authMiddleware, pedidoRoutes);
app.use("/receitas-medicas", authMiddleware, receitaMedicaRoutes);
app.use("/carrinho", authMiddleware, carrinhoRoutes);
app.use("/horarios", authMiddleware, horarioFuncionamentoRoutes);

export const startServer = async () => {
  try {
    await syncDatabase();
    
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
