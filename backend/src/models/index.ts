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
