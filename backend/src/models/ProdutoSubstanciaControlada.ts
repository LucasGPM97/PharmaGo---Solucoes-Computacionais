import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Produto from "./Produto";
import SubstanciaControlada from "./SubstanciaControlada";

class ProdutoSubstanciaControlada extends Model {
  public substancia_controlada_idsubestancia_controlada!: number;
  public produto_idproduto!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProdutoSubstanciaControlada.init(
  {
    substancia_controlada_idsubestancia_controlada: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    produto_idproduto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "produto_substancia_controlada",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Produto.belongsToMany(SubstanciaControlada, {
  through: ProdutoSubstanciaControlada,
  foreignKey: "produto_idproduto",
  otherKey: "substancia_controlada_idsubstancia_controlada",
  as: "substancia_controlada",
});

SubstanciaControlada.belongsToMany(Produto, {
  through: ProdutoSubstanciaControlada,
  foreignKey: "substancia_controlada_idsubstancia_controlada",
  otherKey: "produto_idproduto",
  as: "produto",
});

export default ProdutoSubstanciaControlada;
