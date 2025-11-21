import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Cliente from "./Cliente";
import CarrinhoItem from "./CarrinhoItem";

class Carrinho extends Model {
  public idcarrinho!: number;
  public cliente_idcliente!: number;
  public total!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public carrinho_item!: CarrinhoItem[];
}

Carrinho.init(
  {
    idcarrinho: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cliente_idcliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "carrinho",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Carrinho;
