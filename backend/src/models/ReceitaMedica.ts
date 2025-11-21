import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Pedido from "./Pedido";

class ReceitaMedica extends Model {
  public idreceita_medica!: number;
  public pedido_idpedido!: number;
  public caminho_documento!: string;
  public status_receita!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ReceitaMedica.init(
  {
    idreceita_medica: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pedido_idpedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    caminho_documento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status_validacao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "receita_medica",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default ReceitaMedica;
