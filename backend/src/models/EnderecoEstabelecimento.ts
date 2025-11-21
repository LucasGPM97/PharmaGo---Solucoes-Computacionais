import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Estabelecimento from "./Estabelecimento";

class EnderecoEstabelecimento extends Model {
  public idendereco_estabelecimento!: number;
  public estabelecimento_idestabelecimento!: number;
  public uf!: string;
  public logradouro!: string;
  public numero!: string;
  public bairro!: string;
  public cidade!: string;
  public estado!: string;
  public cep!: string;
  public latitude!: string;
  public longitude!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EnderecoEstabelecimento.init(
  {
    idendereco_estabelecimento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estabelecimento_idestabelecimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uf: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logradouro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numero: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bairro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cidade: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cep: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "endereco_estabelecimento",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default EnderecoEstabelecimento;
