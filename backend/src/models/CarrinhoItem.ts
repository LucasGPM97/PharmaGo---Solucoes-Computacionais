import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Carrinho from "./Carrinho";
import CatalogoProduto from "./CatalogoProduto";
import Produto from "./Produto";

class CarrinhoItem extends Model {
  public idcarrinho_item!: number;
  public carrinho_idcarrinho!: number;
  public catalogo_produto_idcatalogo_produto!: number;
  public quantidade!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public catalogo_produto!: CatalogoProduto;
  public produto!: Produto;
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

export default CarrinhoItem;
