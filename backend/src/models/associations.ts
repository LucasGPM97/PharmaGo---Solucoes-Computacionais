import Cliente from "./Cliente";
import EnderecoCliente from "./EnderecoCliente";
import EnderecoEstabelecimento from "./EnderecoEstabelecimento";
import Estabelecimento from "./Estabelecimento";
import Catalogo from "./Catalogo";
import Produto from "./Produto";
import CatalogoProduto from "./CatalogoProduto";
import Carrinho from "./Carrinho";
import CarrinhoItem from "./CarrinhoItem";
import Pedido from "./Pedido";
import PedidoItem from "./PedidoItem";
import ReceitaMedica from "./ReceitaMedica";
import FormaPagamento from "./FormaPagamento";
import HorarioFuncionamento from "./HorarioFuncionamento";
import ImagemProduto from "./ImagemProduto";
import FarmaciaPermissoes from "./FarmaciaPermissoes";
import SubstanciaControlada from "./SubstanciaControlada";
import ProdutoSubstanciaControlada from "./ProdutoSubstanciaControlada";

export const setupAssociations = () => {

// ... Associações existentes (Carrinho, Catalogo, etc.) ...

PedidoItem.belongsTo(Pedido, { foreignKey: "pedido_idpedido", as: "pedido" });
Pedido.hasMany(PedidoItem, {
  foreignKey: "pedido_idpedido",
  as: "pedido_itens",
});

PedidoItem.belongsTo(CatalogoProduto, {
  foreignKey: "catalogo_produto_idcatalogo_produto",
  as: "catalogo_produto",
});
CatalogoProduto.hasMany(PedidoItem, {
  foreignKey: "catalogo_produto_idcatalogo_produto",
  as: "catalogo_produto",
});
Produto.belongsToMany(SubstanciaControlada, {
  through: ProdutoSubstanciaControlada,
  foreignKey: "produto_idproduto",
  otherKey: "substancia_controlada_idsubstancia_controlada",
  as: "substancia_controlada",
});

SubstanciaControlada.belongsToMany(Produto, {
  through: ProdutoSubstanciaControlada,
  foreignKey: "substancia_controlada_idsubstancia_controlada",
  otherKey: "produto_idproduto",
  as: "produto",
});
ReceitaMedica.belongsTo(Pedido, {
  foreignKey: "pedido_idpedido",
  as: "pedido",
});
Pedido.hasOne(ReceitaMedica, {
  foreignKey: "pedido_idpedido",
  as: "receita_medica",
});
Pedido.belongsTo(Cliente, { foreignKey: "cliente_idcliente", as: "cliente" });
Cliente.hasMany(Pedido, { foreignKey: "cliente_idcliente", as: "pedido" });

Pedido.belongsTo(Estabelecimento, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "estabelecimento",
});
Estabelecimento.hasMany(Pedido, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "pedidos",
});

Pedido.belongsTo(EnderecoCliente, {
  foreignKey: "endereco_cliente_idendereco_cliente",
  as: "endereco_cliente",
});
EnderecoCliente.hasMany(Pedido, {
  foreignKey: "endereco_cliente_idendereco_cliente",
  as: "pedido",
});

Pedido.belongsTo(FormaPagamento, {
  foreignKey: "forma_pagamento_idforma_pagamento",
  as: "forma_pagamento",
});
FormaPagamento.hasMany(Pedido, {
  foreignKey: "forma_pagamento_idforma_pagamento",
  as: "pedido",
});
ImagemProduto.belongsTo(Produto, {
  foreignKey: "produto_idproduto",
  as: "produto",
});
Produto.hasMany(ImagemProduto, {
  foreignKey: "produto_idproduto",
  as: "imagem_produto",
});
HorarioFuncionamento.belongsTo(Estabelecimento, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "estabelecimento",
});
Estabelecimento.hasMany(HorarioFuncionamento, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "horario_funcionamento",
});
FarmaciaPermissoes.belongsTo(Estabelecimento, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "estabelecimento",
});
Estabelecimento.hasMany(FarmaciaPermissoes, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "farmacia_permissoes",
});
EnderecoEstabelecimento.belongsTo(Estabelecimento, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "estabelecimento",
});
Estabelecimento.hasOne(EnderecoEstabelecimento, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "endereco_estabelecimento",
});
EnderecoCliente.belongsTo(Cliente, {
  foreignKey: "cliente_idcliente",
  as: "cliente",
});
Cliente.hasMany(EnderecoCliente, {
  foreignKey: "cliente_idcliente",
  as: "endereco_cliente",
});
CatalogoProduto.belongsTo(Catalogo, {
  foreignKey: "catalogo_idcatalogo",
  as: "catalogo",
});
Catalogo.hasMany(CatalogoProduto, {
  foreignKey: "catalogo_idcatalogo",
  as: "catalogo_produto",
});

CatalogoProduto.belongsTo(Produto, {
  foreignKey: "produto_idproduto",
  as: "produto",
});
Produto.hasMany(CatalogoProduto, {
  foreignKey: "produto_idproduto",
  as: "catalogo_produto",
});
Catalogo.belongsTo(Estabelecimento, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "estabelecimento",
});
CarrinhoItem.belongsTo(Carrinho, {
  foreignKey: "carrinho_idcarrinho",
  as: "carrinho",
});
Carrinho.hasMany(CarrinhoItem, {
  foreignKey: "carrinho_idcarrinho",
  as: "carrinho_item",
});

CarrinhoItem.belongsTo(CatalogoProduto, {
  foreignKey: "catalogo_produto_idcatalogo_produto",
  as: "catalogo_produto",
});
CatalogoProduto.hasMany(CarrinhoItem, {
  foreignKey: "catalogo_produto_idcatalogo_produto",
  as: "carrinho_item",
});
Carrinho.belongsTo(Cliente, { foreignKey: "cliente_idcliente", as: "cliente" });
Cliente.hasOne(Carrinho, { foreignKey: "cliente_idcliente", as: "carrinho" });

  console.log("✅ Todas as associações foram configuradas com sucesso!");
};