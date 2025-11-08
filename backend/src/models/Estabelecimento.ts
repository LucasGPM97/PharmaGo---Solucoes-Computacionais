import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Estabelecimento extends Model {
  public idestabelecimento!: number;
  public cnpj!: string;
  public email!: string;
  public razao_social!: string;
  public registro_anvisa!: string;
  public responsavel_tecnico!: string;
  public telefone_contato!: string;
  public conta_bancaria!: string;
  public raio_cobertura!: number;
  public valor_minimo_entrega!: number;
  public taxa_entrega!: number;
  public logo_url!: string;
  public senha!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Estabelecimento.init(
  {
    idestabelecimento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cnpj: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    razao_social: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registro_anvisa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    responsavel_tecnico: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefone_contato: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    conta_bancaria: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    raio_cobertura: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    valor_minimo_entrega: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    taxa_entrega: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "estabelecimento",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Estabelecimento;
