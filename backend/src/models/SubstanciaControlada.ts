import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class SubstanciaControlada extends Model {
  public produto_idproduto!: number;
  public nome!: string;
  public lista_anvisa!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SubstanciaControlada.init(
  {
    idsubestancia_controlada: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lista_anvisa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "substancia_controlada",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SubstanciaControlada;
