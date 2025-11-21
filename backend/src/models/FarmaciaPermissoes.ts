import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Estabelecimento from "./Estabelecimento";

class FarmaciaPermissoes extends Model {
  public idfarmacia_permissoes!: number;
  public estabelecimento_idestabelecimento!: number;
  public lista_anvisa!: string;
  public data_inicio!: Date;
  public data_fim!: Date;
  public ativo!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FarmaciaPermissoes.init(
  {
    idfarmacia_permissoes: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estabelecimento_idestabelecimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lista_anvisa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    data_fim: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "farmacia_permissoes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default FarmaciaPermissoes;
