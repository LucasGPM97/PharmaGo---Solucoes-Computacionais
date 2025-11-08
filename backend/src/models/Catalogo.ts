import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Estabelecimento from "./Estabelecimento";

class Catalogo extends Model {
  public idcatalogo!: number;
  public estabelecimento_idestabelecimento!: number;

  public estabelecimento!: Estabelecimento;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Catalogo.init(
  {
    idcatalogo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    estabelecimento_idestabelecimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "catalogo",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Catalogo.belongsTo(Estabelecimento, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "estabelecimento",
});

export default Catalogo;
