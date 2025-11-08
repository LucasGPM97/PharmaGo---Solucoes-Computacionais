import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Cliente from "./Cliente";

class EnderecoCliente extends Model {
  public idendereco_cliente!: number;
  public cliente_idcliente!: number;
  public uf!: string;
  public nome_endereco!: string;
  public logradouro!: string;
  public numero!: string;
  public bairro!: string;
  public cidade!: string;
  public estado!: string;
  public cep!: string;
  public latitude!: string;
  public longitude!: string;
  public ativo!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EnderecoCliente.init(
  {
    idendereco_cliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cliente_idcliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uf: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nome_endereco: {
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
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "endereco_cliente",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
EnderecoCliente.belongsTo(Cliente, {
  foreignKey: "cliente_idcliente",
  as: "cliente",
});
Cliente.hasMany(EnderecoCliente, {
  foreignKey: "cliente_idcliente",
  as: "endereco_cliente",
});

export default EnderecoCliente;
