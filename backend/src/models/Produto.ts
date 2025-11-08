import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Produto extends Model {
  public idproduto!: number;
  public nome_comercial!: string;
  public substancia_ativa?: string;
  public apresentacao?: string;
  public registro_anvisa?: string;
  public detentor_registro?: string;
  public link_bula!: string;
  public preco_cmed!: number;
  public requer_receita!: boolean;
  public classe_terapeutica!: string;
  public tipo_produto!: string;
  public tarja!: string;
  public forma_terapeutica!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Produto.init(
  {
    idproduto: {
      type: DataTypes.STRING,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_comercial: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    substancia_ativa: {
      type: DataTypes.STRING(1600),
      allowNull: false,
    },
    apresentacao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registro_anvisa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detentor_registro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    link_bula: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preco_cmed: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    requer_receita: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    classe_terapeutica: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo_produto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tarja: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    forma_terapeutica: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "produto",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Produto;
