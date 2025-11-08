import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Pedido from "./Pedido";
import CatalogoProduto from "./CatalogoProduto";

class PedidoItem extends Model {
  public idpedido_item!: number;
  public pedido_idpedido!: number;
  public catalogo_produto_idcatalogo_produto!: number;
  public quantidade!: number;
  public valor_unitario_venda!: number;
  public valor_subtotal!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public catalogo_produto!: CatalogoProduto;
}

PedidoItem.init(
  {
    idpedido_item: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pedido_idpedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    catalogo_produto_idcatalogo_produto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    valor_unitario_venda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1,
    },
    valor_subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "pedido_item",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

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

export default PedidoItem;
