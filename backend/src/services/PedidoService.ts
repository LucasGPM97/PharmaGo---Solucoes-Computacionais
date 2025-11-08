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
        // 1. Itens do Pedido (Já corrigido o alias para 'pedido_itens')
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
        // 2. Estabelecimento (para o cabeçalho)
        { model: Estabelecimento, as: "estabelecimento" },
        // 3. Endereço do Cliente (para a seção de endereço)
        { model: EnderecoCliente, as: "endereco_cliente" },
        // 4. Forma de Pagamento (para a seção de pagamento)
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
        order: [["data_pedido", "DESC"]], // Ordena por data mais recente
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

  // -----------------------------------------------------------------
  // NOVO MÉTODO: CRIAÇÃO DO PEDIDO A PARTIR DO CARRINHO (CHECKOUT)
  // -----------------------------------------------------------------
  public async criarPedidoDoCarrinho(
    clienteId: number,
    carrinhoId: number,
    dadosAdicionais: {
      endereco_cliente_idendereco_cliente: number;
      forma_pagamento_idforma_pagamento: number;
      observacoes?: string;
    } // Use DTO mais específico na produção
  ): Promise<Pedido> {
    // 1. Inicia a Transação
    const t: Transaction = await sequelize.transaction();

    try {
      // A. Busca os Itens do Carrinho
      const itensCarrinho = await CarrinhoService.getCarrinhoCompleto(
        clienteId
      );

      if (!itensCarrinho || itensCarrinho.carrinho_item?.length === 0) {
        throw new Error(
          "O carrinho está vazio ou não existe para este cliente."
        );
      }

      const itensParaClonar = itensCarrinho.carrinho_item;

      // B. Valida a Regra de Negócio (Um estabelecimento por pedido)
      // Já garantimos que o Carrinho só tem itens de um estabelecimento.
      // Precisamos apenas pegar o ID desse estabelecimento.
      const primeiroItem = itensParaClonar[0];
      const estabelecimentoId =
        primeiroItem.catalogo_produto.catalogo
          .estabelecimento_idestabelecimento;

      // C. Calcula o Valor Total Final (O total no Carrinho já deve estar correto)
      const valorTotal = itensCarrinho.total; // Assumimos que a taxa de entrega/etc. é calculada no Controller/Front e passada aqui, ou recalculada aqui. Por simplicidade, usaremos o total do Carrinho.

      // D. Cria o Pedido Principal (Header)
      const novoPedido = await Pedido.create(
        {
          cliente_idcliente: clienteId,
          estabelecimento_idestabelecimento: estabelecimentoId,
          endereco_cliente_idendereco_cliente:
            dadosAdicionais.endereco_cliente_idendereco_cliente,
          forma_pagamento_idforma_pagamento:
            dadosAdicionais.forma_pagamento_idforma_pagamento,
          status: "Aguardando Pagamento", // Status inicial após checkout
          valor_total: valorTotal,
          observacoes: dadosAdicionais.observacoes,
          // REMOVEMOS carrinho_idcarrinho conforme combinado
        },
        { transaction: t }
      );

      // E. Clona os Itens para PedidoItem (Detalhe/Imutável)
      const itensPedidoParaCriar = itensParaClonar.map((item) => {
        const valorUnitarioVenda = item.catalogo_produto.valor_venda;
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

      // F. Limpa/Finaliza o Carrinho
      await CarrinhoService.limparCarrinhoTransacional(carrinhoId, t);

      // G. Confirma a Transação
      await t.commit();

      console.log(
        "✅ Pedido criado e itens clonados com sucesso:",
        novoPedido.idpedido
      );
      return novoPedido;
    } catch (error) {
      // H. Desfaz tudo em caso de falha
      await t.rollback();
      console.error("❌ Erro durante o processo de checkout:", error);
      throw error;
    }
  }
}

export default new PedidoService();
