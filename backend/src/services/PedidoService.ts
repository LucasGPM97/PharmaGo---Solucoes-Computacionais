import Pedido from "../models/Pedido";
import CatalogoProduto from "../models/CatalogoProduto";
import Produto from "../models/Produto";
import Carrinho from "../models/Carrinho";
import CarrinhoService from "./CarrinhoService";
import PedidoItem from "../models/PedidoItem";
import sequelize from "../config/database";
import { Transaction } from "sequelize";
import Estabelecimento from "../models/Estabelecimento";
import EnderecoCliente from "../models/EnderecoCliente";
import FormaPagamento from "../models/FormaPagamento";
import Cliente from "../models/Cliente";

class PedidoService {
  public async createPedido(data: any): Promise<Pedido> {
    const {
      cliente_idcliente,
      estabelecimento_idestabelecimento,
      endereco_cliente_idendereco_cliente,
      forma_pagamento_idforma_pagamento,
      carrinho_idcarrinho,
      status,
      valor_total,
      observacoes,
    } = data;

    const pedido = await Pedido.create({
      cliente_idcliente,
      estabelecimento_idestabelecimento,
      endereco_cliente_idendereco_cliente,
      forma_pagamento_idforma_pagamento,
      carrinho_idcarrinho,
      status,
      valor_total,
      observacoes,
    });

    return pedido;
  }

  public async getPedidoById(idpedido: number): Promise<Pedido | null> {
    const pedido = await Pedido.findByPk(idpedido, {
      include: [
        {
          model: PedidoItem,
          as: "pedido_itens",
          include: [
            {
              model: CatalogoProduto,
              as: "catalogo_produto",
              include: [{ model: Produto, as: "produto" }],
            },
          ],
        },
        { model: Estabelecimento, as: "estabelecimento" },
        { model: EnderecoCliente, as: "endereco_cliente" },
        { model: FormaPagamento, as: "forma_pagamento" },
      ],
    });
    return pedido;
  }

  public async getAllPedidosByCliente(
    cliente_idcliente: number
  ): Promise<Pedido[]> {
    const pedidos = await Pedido.findAll({
      where: { cliente_idcliente },
      include: [
        {
          model: PedidoItem,
          as: "pedido_itens",
          include: [
            {
              model: CatalogoProduto,
              as: "catalogo_produto",
              include: [{ model: Produto, as: "produto" }],
            },
          ],
        },
      ],
    });
    return pedidos;
  }

  public async getAllPedidosByEstabelecimento(
    estabelecimento_idestabelecimento: number
  ): Promise<Pedido[]> {
    console.log(
      `[DEBUG] Buscando pedidos para estabelecimento: ${estabelecimento_idestabelecimento}`
    );

    try {
      const pedidos = await Pedido.findAll({
        where: { estabelecimento_idestabelecimento },
        include: [
          {
            model: PedidoItem,
            as: "pedido_itens",
            include: [
              {
                model: CatalogoProduto,
                as: "catalogo_produto",
                include: [
                  {
                    model: Produto,
                    as: "produto",
                  },
                ],
              },
            ],
          },
          {
            model: Cliente,
            as: "cliente",
          },
          {
            model: EnderecoCliente,
            as: "endereco_cliente",
          },
          {
            model: FormaPagamento,
            as: "forma_pagamento",
          },
        ],
        order: [["data_pedido", "DESC"]],
      });

      console.log(`[DEBUG] Pedidos encontrados: ${pedidos.length}`);
      return pedidos;
    } catch (error) {
      console.error(
        `[ERROR] Erro ao buscar pedidos do estabelecimento:`,
        error
      );
      throw error;
    }
  }

  public async updatePedido(
    idpedido: number,
    data: any
  ): Promise<[number, Pedido[]]> {
    const [affectedCount, affectedRows] = await Pedido.update(data, {
      where: { idpedido },
      returning: true,
    });
    return [affectedCount, affectedRows];
  }

  public async deletePedido(idpedido: number): Promise<number> {
    const deletedRows = await Pedido.destroy({
      where: { idpedido },
    });
    return deletedRows;
  }

  public async criarPedidoDoCarrinho(
    clienteId: number,
    carrinhoId: number,
    dadosAdicionais: {
      endereco_cliente_idendereco_cliente: number;
      forma_pagamento_idforma_pagamento: number;
      observacoes?: string;
    }
  ): Promise<Pedido> {
    const t: Transaction = await sequelize.transaction();

    try {
      const itensCarrinho = await CarrinhoService.getCarrinhoCompleto(
        clienteId
      );

      if (
        !itensCarrinho ||
        !itensCarrinho.carrinho_item ||
        itensCarrinho.carrinho_item.length === 0
      ) {
        throw new Error(
          "O carrinho está vazio ou não existe para este cliente."
        );
      }

      const itensParaClonar = itensCarrinho.carrinho_item;

      const primeiroItem = itensParaClonar[0];
      const estabelecimentoId =
        primeiroItem.catalogo_produto.catalogo
          .estabelecimento_idestabelecimento;

      let subtotalRecalculado = 0;

      itensParaClonar.forEach((item: any) => {
        const valorUnitario =
          typeof item.catalogo_produto.valor_venda === "string"
            ? parseFloat(item.catalogo_produto.valor_venda)
            : item.catalogo_produto.valor_venda;

        const quantidade = item.quantidade;
        subtotalRecalculado += valorUnitario * quantidade;
      });

      subtotalRecalculado = Math.round(subtotalRecalculado * 100) / 100;

      const estabelecimentoData =
        primeiroItem.catalogo_produto.catalogo.estabelecimento;
      const taxaEntrega = estabelecimentoData?.taxa_entrega
        ? typeof estabelecimentoData.taxa_entrega === "string"
          ? parseFloat(estabelecimentoData.taxa_entrega)
          : estabelecimentoData.taxa_entrega
        : 0;

      const valorMinimoEntrega = estabelecimentoData?.valor_minimo_entrega
        ? typeof estabelecimentoData.valor_minimo_entrega === "string"
          ? parseFloat(estabelecimentoData.valor_minimo_entrega)
          : estabelecimentoData.valor_minimo_entrega
        : 0;

      const taxaAplicada =
        subtotalRecalculado >= valorMinimoEntrega ? 0.0 : taxaEntrega;
      const valorTotalRecalculado = subtotalRecalculado + taxaAplicada;

      console.log("💰 Valores do Pedido:", {
        subtotal: subtotalRecalculado,
        taxaEntregaConfigurada: taxaEntrega,
        valorMinimoEntrega: valorMinimoEntrega,
        taxaAplicada: taxaAplicada,
        totalFinal: valorTotalRecalculado,
        totalDoCarrinhoAntigo: itensCarrinho.total,
        itens: itensParaClonar.map((item: any) => ({
          produto:
            item.catalogo_produto.produto?.nome_comercial ||
            "Produto não encontrado",
          preco: item.catalogo_produto.valor_venda,
          quantidade: item.quantidade,
          subtotal:
            (typeof item.catalogo_produto.valor_venda === "string"
              ? parseFloat(item.catalogo_produto.valor_venda)
              : item.catalogo_produto.valor_venda) * item.quantidade,
        })),
      });

      const novoPedido = await Pedido.create(
        {
          cliente_idcliente: clienteId,
          estabelecimento_idestabelecimento: estabelecimentoId,
          endereco_cliente_idendereco_cliente:
            dadosAdicionais.endereco_cliente_idendereco_cliente,
          forma_pagamento_idforma_pagamento:
            dadosAdicionais.forma_pagamento_idforma_pagamento,
          status: "Aguardando Pagamento",
          valor_total: valorTotalRecalculado,
          observacoes: dadosAdicionais.observacoes,
        },
        { transaction: t }
      );

      const itensPedidoParaCriar = itensParaClonar.map((item: any) => {
        const valorUnitarioVenda =
          typeof item.catalogo_produto.valor_venda === "string"
            ? parseFloat(item.catalogo_produto.valor_venda)
            : item.catalogo_produto.valor_venda;

        const quantidade = item.quantidade;

        return {
          pedido_idpedido: novoPedido.idpedido,
          catalogo_produto_idcatalogo_produto:
            item.catalogo_produto_idcatalogo_produto,
          quantidade: quantidade,
          valor_unitario_venda: valorUnitarioVenda,
          valor_subtotal: valorUnitarioVenda * quantidade,
        };
      });

      await PedidoItem.bulkCreate(itensPedidoParaCriar, { transaction: t });
      await CarrinhoService.limparCarrinhoTransacional(carrinhoId, t);
      await t.commit();

      console.log("✅ Pedido criado com valor correto:", {
        pedidoId: novoPedido.idpedido,
        valorTotal: valorTotalRecalculado,
      });

      return novoPedido;
    } catch (error) {
      await t.rollback();
      console.error("❌ Erro durante o processo de checkout:", error);
      throw error;
    }
  }
}

export default new PedidoService();
