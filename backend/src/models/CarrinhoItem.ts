import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Carrinho from "./Carrinho";
import CatalogoProduto from "./CatalogoProduto";

class CarrinhoItem extends Model {
  public idcarrinho_item!: number;
  public carrinho_idcarrinho!: number;
  public catalogo_produto_idcatalogo_produto!: number;
  public quantidade!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public catalogo_produto!: CatalogoProduto;
}

CarrinhoItem.init(
  {
    idcarrinho_item: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    carrinho_idcarrinho: {
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
  },
  {
    sequelize,
    tableName: "carrinho_item",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

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

export default CarrinhoItem;
