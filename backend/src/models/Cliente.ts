import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Cliente extends Model {
  public idcliente!: number;
  public email!: string;
  public nome!: string;
  public senha!: string;
  public documento_identificacao!: string;
  public data_nascimento!: Date;
  public numero_contato!: string;
  public imagem_perfil_url!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cliente.init(
  {
    idcliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documento_identificacao: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    data_nascimento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    numero_contato: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imagem_perfil_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "cliente",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Cliente;
