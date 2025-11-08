import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Cliente from "./Cliente";
import Estabelecimento from "./Estabelecimento";
import EnderecoCliente from "./EnderecoCliente";
import FormaPagamento from "./FormaPagamento";
import Carrinho from "./Carrinho";

class Pedido extends Model {
  public idpedido!: number;
  public cliente_idcliente!: number;
  public estabelecimento_idestabelecimento!: number;
  public endereco_cliente_idendereco_cliente!: number;
  public forma_pagamento_idforma_pagamento!: number;
  public data_pedido!: Date;
  public status!: string;
  public valor_total!: number;
  public observacoes?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Pedido.init(
  {
    idpedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cliente_idcliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estabelecimento_idestabelecimento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    endereco_cliente_idendereco_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    forma_pagamento_idforma_pagamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    data_pedido: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Pendente",
      allowNull: false,
    },
    valor_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "pedido",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Pedido.belongsTo(Cliente, { foreignKey: "cliente_idcliente", as: "cliente" });
Cliente.hasMany(Pedido, { foreignKey: "cliente_idcliente", as: "pedido" });

Pedido.belongsTo(Estabelecimento, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "estabelecimento",
});
Estabelecimento.hasMany(Pedido, {
  foreignKey: "estabelecimento_idestabelecimento",
  as: "pedidos",
});

Pedido.belongsTo(EnderecoCliente, {
  foreignKey: "endereco_cliente_idendereco_cliente",
  as: "endereco_cliente",
});
EnderecoCliente.hasMany(Pedido, {
  foreignKey: "endereco_cliente_idendereco_cliente",
  as: "pedido",
});

Pedido.belongsTo(FormaPagamento, {
  foreignKey: "forma_pagamento_idforma_pagamento",
  as: "forma_pagamento",
});
FormaPagamento.hasMany(Pedido, {
  foreignKey: "forma_pagamento_idforma_pagamento",
  as: "pedido",
});

export default Pedido;
