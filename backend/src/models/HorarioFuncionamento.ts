import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Estabelecimento from "./Estabelecimento";

class HorarioFuncionamento extends Model {
  public idhorario_funcionamento!: number;
  public estabelecimento_idestabelecimento!: number;
  public dia!: number;
  public horario_abertura!: string;
  public horario_fechamento!: string;
  public fechado!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

HorarioFuncionamento.init(
  {
    idhorario_funcionamento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    estabelecimento_idestabelecimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dia: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    horario_abertura: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    horario_fechamento: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    fechado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "horario_funcionamento",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default HorarioFuncionamento;
