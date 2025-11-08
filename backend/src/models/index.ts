import sequelize from "../config/database";
import Cliente from "./Cliente";
import EnderecoCliente from "./EnderecoCliente";
import EnderecoEstabelecimento from "./EnderecoEstabelecimento";
import FormaPagamento from "./FormaPagamento";
import Estabelecimento from "./Estabelecimento";
import Produto from "./Produto";
import CatalogoProduto from "./CatalogoProduto";
import ImagemProduto from "./ImagemProduto";
import Pedido from "./Pedido";
import ReceitaMedica from "./ReceitaMedica";
import Carrinho from "./Carrinho";
import CarrinhoItem from "./CarrinhoItem";

const initializeAssociations = () => {
  console.log("=== INICIALIZANDO ASSOCIAÇÕES ===");

  // Testar associações do CarrinhoItem
  console.log(
    "🔍 Associações do CarrinhoItem:",
    Object.keys(CarrinhoItem.associations)
  );

  // Testar associações do Carrinho
  console.log(
    "🔍 Associações do Carrinho:",
    Object.keys(Carrinho.associations)
  );

  // Verificar detalhes das associações do Carrinho
  Object.entries(Carrinho.associations).forEach(([key, association]) => {
    console.log(`   Carrinho.${key}:`, {
      foreignKey: association.foreignKey,
      target: association.target.name,
      as: association.as,
    });
  });

  // Verificar detalhes das associações do CarrinhoItem
  Object.entries(CarrinhoItem.associations).forEach(([key, association]) => {
    console.log(`   CarrinhoItem.${key}:`, {
      foreignKey: association.foreignKey,
      target: association.target.name,
      as: association.as,
    });
  });
};

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
};

export {
  sequelize,
  syncDatabase,
  Cliente,
  EnderecoCliente,
  EnderecoEstabelecimento,
  FormaPagamento,
  Estabelecimento,
  Produto,
  CatalogoProduto,
  ImagemProduto,
  Pedido,
  ReceitaMedica,
  Carrinho,
  CarrinhoItem,
};
