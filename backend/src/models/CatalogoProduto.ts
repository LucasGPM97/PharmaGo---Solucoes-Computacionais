import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Produto from "./Produto";
import Catalogo from "./Catalogo";

class CatalogoProduto extends Model {
  public idcatalogo_produto!: number;
  public catalogo_idcatalogo!: number;
  public produto_idproduto!: number;
  public disponibilidade!: boolean;
  public valor_venda!: number;

  public catalogo!: Catalogo;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CatalogoProduto.init(
  {
    idcatalogo_produto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    catalogo_idcatalogo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    produto_idproduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    disponibilidade: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    valor_venda: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "catalogo_produto",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "unique_catalogo_produto",
        unique: true,
        fields: ["produto_idproduto", "catalogo_idcatalogo"],
      },
    ],
  }
);

CatalogoProduto.belongsTo(Catalogo, {
  foreignKey: "catalogo_idcatalogo",
  as: "catalogo",
});
Catalogo.hasMany(CatalogoProduto, {
  foreignKey: "catalogo_idcatalogo",
  as: "catalogo_produto",
});

CatalogoProduto.belongsTo(Produto, {
  foreignKey: "produto_idproduto",
  as: "produto",
});
Produto.hasMany(CatalogoProduto, {
  foreignKey: "produto_idproduto",
  as: "catalogo_produto",
});

export default CatalogoProduto;
