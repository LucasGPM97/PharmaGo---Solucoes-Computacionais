import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class FormaPagamento extends Model {
  public idforma_pagamento!: number;
  public nome!: string;
  public ativo!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FormaPagamento.init(
  {
    idforma_pagamento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "forma_pagamento",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default FormaPagamento;
