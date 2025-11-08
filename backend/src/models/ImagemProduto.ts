import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Produto from "./Produto";

class ImagemProduto extends Model {
  public idimagem_produto!: number;
  public produto_idproduto!: string;
  public caminho_imagem!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ImagemProduto.init(
  {
    idimagem_produto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    produto_idproduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    caminho_imagem: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "imagem_produto",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

ImagemProduto.belongsTo(Produto, {
  foreignKey: "produto_idproduto",
  as: "produto",
});
Produto.hasMany(ImagemProduto, {
  foreignKey: "produto_idproduto",
  as: "imagem_produto",
});

export default ImagemProduto;
