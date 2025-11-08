import { Transaction } from "sequelize";
import Carrinho from "../models/Carrinho";
import CarrinhoItem from "../models/CarrinhoItem";
import CatalogoProduto from "../models/CatalogoProduto";
import Produto from "../models/Produto";
import Catalogo from "../models/Catalogo";

class CarrinhoService {
  public async getOrCreateCarrinho(
    cliente_idcliente: number
  ): Promise<Carrinho> {
    try {
      console.log("🔍 Buscando carrinho para cliente:", cliente_idcliente);

      // BUSCA SIMPLES - SEM INCLUDES
      let carrinho = await Carrinho.findOne({
        where: { cliente_idcliente },
      });

      if (!carrinho) {
        console.log(
          "🛒 Criando novo carrinho para cliente:",
          cliente_idcliente
        );
        carrinho = await Carrinho.create({
          idcarrinho: cliente_idcliente,
          cliente_idcliente,
          status: "ativo",
          total: 0.0,
        });
        console.log("✅ Carrinho criado com ID:", carrinho.idcarrinho);
      } else {
        console.log("✅ Carrinho encontrado com ID:", carrinho.idcarrinho);
      }

      return carrinho;
    } catch (error) {
      console.error("❌ Erro em getOrCreateCarrinho:", error);
      throw error;
    }
  }

  public async updateCarrinhoTotal(idcarrinho: number): Promise<void> {
    try {
      console.log("🔄 Atualizando total do carrinho:", idcarrinho);

      // ✅ USE O ALIAS CORRETO: catalogo_produto (com underline)
      const itens = await CarrinhoItem.findAll({
        where: { carrinho_idcarrinho: idcarrinho },
        include: [
          {
            model: CatalogoProduto,
            as: "catalogo_produto", // ← ALIAS CORRETO
            attributes: ["valor_venda"],
          },
        ],
      });

      let total = 0;

      for (const item of itens) {
        // ✅ AGORA deve funcionar - catalogo_produto existe
        const precoUnitario = item.catalogo_produto.valor_venda;
        const quantidade = item.quantidade;
        total += precoUnitario * quantidade;
        console.log(
          `   Item ${item.idcarrinho_item}: ${quantidade} x R$ ${precoUnitario}`
        );
      }

      total = Math.round(total * 100) / 100;

      await Carrinho.update({ total }, { where: { idcarrinho } });

      console.log("✅ Total do carrinho atualizado:", total);
    } catch (error) {
      console.error("❌ Erro ao atualizar total do carrinho:", error);
      throw error;
    }
  }

  public async getCarrinhoComItens(cliente_idcliente: number): Promise<any> {
    try {
      console.log(
        "🔍 Buscando carrinho com itens para cliente:",
        cliente_idcliente
      );

      const carrinho = await Carrinho.findOne({
        where: { cliente_idcliente },
        include: [
          {
            model: CarrinhoItem,
            as: "carrinho_item",
            include: [
              {
                model: CatalogoProduto,
                as: "catalogo_produto", // ← ALIAS CORRETO
                include: [
                  {
                    model: Produto,
                    as: "produto",
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!carrinho) {
        console.log("   Carrinho não encontrado");
        return null;
      }

      console.log(
        "✅ Carrinho encontrado com",
        carrinho.carrinho_item?.length || 0,
        "itens"
      );
      return carrinho;
    } catch (error) {
      console.error("❌ Erro ao buscar carrinho com itens:", error);
      return null;
    }
  }

  /**
   * Auxiliar para buscar o ID do estabelecimento de um item do carrinho.
   * @param idcatalogo_produto ID do item do catálogo a ser verificado.
   */
  private async getEstabelecimentoIdFromCatalogoProduto(
    idcatalogo_produto: number
  ): Promise<number> {
    const catalogoProduto = await CatalogoProduto.findByPk(idcatalogo_produto, {
      include: [
        {
          model: Catalogo,
          as: "catalogo", // Deve ser o alias da associação CatalogoProduto -> Catalogo
          attributes: ["estabelecimento_idestabelecimento"],
        },
      ],
    });

    if (!catalogoProduto || !catalogoProduto.catalogo) {
      throw new Error(
        `Catálogo Produto com ID ${idcatalogo_produto} não encontrado ou sem vínculo com Catálogo.`
      );
    }

    // Acesso aninhado para pegar o FK do estabelecimento
    return catalogoProduto.catalogo.estabelecimento_idestabelecimento;
  }

  /**
   * Adiciona um item ao carrinho, aplicando a restrição de "um estabelecimento por carrinho".
   */
  public async addItemToCarrinho(
    idcarrinho: number,
    idcatalogo_produto: number,
    quantidade: number
  ): Promise<CarrinhoItem> {
    try {
      // 1. VERIFICAÇÃO DE ESTABELECIMENTO

      // a. Busca todos os itens existentes no carrinho
      const itensExistentes = await CarrinhoItem.findAll({
        where: { carrinho_idcarrinho: idcarrinho },
        limit: 1, // Basta verificar o primeiro item, se existir
      });

      if (itensExistentes.length > 0) {
        // b. Se houver itens, pega o ID do estabelecimento do item existente
        const idCatalogoProdutoExistente =
          itensExistentes[0].catalogo_produto_idcatalogo_produto;
        const estabelecimentoIdExistente =
          await this.getEstabelecimentoIdFromCatalogoProduto(
            idCatalogoProdutoExistente
          );

        // c. Pega o ID do estabelecimento do NOVO item
        const estabelecimentoIdNovo =
          await this.getEstabelecimentoIdFromCatalogoProduto(
            idcatalogo_produto
          );

        // d. Compara os IDs
        if (estabelecimentoIdExistente !== estabelecimentoIdNovo) {
          throw new Error(
            "Não é possível adicionar produtos de estabelecimentos diferentes no mesmo carrinho."
          );
        }

        console.log(
          `✅ Item do mesmo estabelecimento (${estabelecimentoIdNovo}) adicionado.`
        );
      }

      // 2. LÓGICA DE INSERÇÃO/ATUALIZAÇÃO
      let item = await CarrinhoItem.findOne({
        where: {
          carrinho_idcarrinho: idcarrinho,
          catalogo_produto_idcatalogo_produto: idcatalogo_produto,
        },
      });

      if (item) {
        item.quantidade += quantidade;
        await item.save();
      } else {
        item = await CarrinhoItem.create({
          carrinho_idcarrinho: idcarrinho,
          catalogo_produto_idcatalogo_produto: idcatalogo_produto,
          quantidade,
        });
      }

      // 3. Atualizar total do carrinho
      await this.updateCarrinhoTotal(idcarrinho);

      return item;
    } catch (error) {
      console.error(
        "❌ Erro ao adicionar item ao carrinho com restrição de estabelecimento:",
        error
      );
      throw error;
    }
  }

  public async removeItemFromCarrinho(
    idcarrinho: number,
    catalogo_produto_idcatalogo_produto: number
  ): Promise<number> {
    const deletedRows = await CarrinhoItem.destroy({
      where: {
        carrinho_idcarrinho: idcarrinho,
        catalogo_produto_idcatalogo_produto,
      },
    });

    // Atualizar total do carrinho se algum item foi removido
    if (deletedRows > 0) {
      await this.updateCarrinhoTotal(idcarrinho);
    }

    return deletedRows;
  }

  public async updateCarrinhoItemQuantity(
    idcarrinho: number,
    idcatalogo_produto: number,
    quantidade: number
  ): Promise<[number, CarrinhoItem[]]> {
    const [affectedCount, affectedRows] = await CarrinhoItem.update(
      { quantidade },
      {
        where: {
          carrinho_idcarrinho: idcarrinho,
          catalogo_produto_idcatalogo_produto: idcatalogo_produto,
        },
        returning: true,
      }
    );

    // Atualizar total do carrinho se a quantidade foi alterada
    if (affectedCount > 0) {
      await this.updateCarrinhoTotal(idcarrinho);
    }

    return [affectedCount, affectedRows];
  }

  public async clearCarrinho(idcarrinho: number): Promise<number> {
    const deletedRows = await CarrinhoItem.destroy({
      where: { carrinho_idcarrinho: idcarrinho },
    });

    // Atualizar total para 0 se itens foram removidos
    if (deletedRows > 0) {
      await Carrinho.update({ total: 0.0 }, { where: { idcarrinho } });
    }

    return deletedRows;
  }

  // No CarrinhoService.ts
  public async getCarrinhoCompleto(cliente_idcliente: number) {
    return await Carrinho.findOne({
      where: { cliente_idcliente: cliente_idcliente },
      include: [
        {
          model: CarrinhoItem,
          as: "carrinho_item",
          include: [
            {
              model: CatalogoProduto,
              as: "catalogo_produto",
              include: [
                // Inclua o Catalogo (como combinamos na etapa anterior)
                { model: Catalogo, as: "catalogo" },

                // 🎯 CORREÇÃO DE EAGER LOADING: Incluir o Produto com o Alias
                {
                  model: Produto,
                  as: "produto", // 🚨 SUBSTITUA PELO ALIAS REAL!
                },
              ],
            },
          ],
        },
      ],
    });
  }

  /**
   * Busca itens do carrinho com os dados do catálogo/preço, pronto para clonagem.
   * Este método deve ser usado pelo PedidoService no momento do checkout.
   */
  /**
   * Busca itens do carrinho com os dados do catálogo/preço E o ID do Estabelecimento.
   */
  public async getItensParaCheckout(
    idcarrinho: number
  ): Promise<CarrinhoItem[]> {
    try {
      return CarrinhoItem.findAll({
        where: { carrinho_idcarrinho: idcarrinho },
        include: [
          {
            model: CatalogoProduto,
            as: "catalogo_produto",
            attributes: ["valor_venda"], // Mantemos só o que é do CatalogoProduto
            include: [
              {
                model: Catalogo,
                as: "catalogo", // 👈 Inclusão do Model Catalogo
                attributes: ["estabelecimento_idestabelecimento"], // 👈 BUSCAMOS O FK AQUI
                // Poderia incluir Estabelecimento se precisasse do nome/outros dados:
                // include: [{
                //   model: Estabelecimento,
                //   as: "estabelecimento",
                //   attributes: ['idestabelecimento'],
                // }]
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("❌ Erro em getItensParaCheckout:", error);
      throw error;
    }
  }

  /**
   * Limpa os itens do carrinho e zera o total dentro de uma transação.
   * @param idcarrinho ID do carrinho a ser limpo.
   * @param t Objeto de transação do Sequelize.
   */
  public async limparCarrinhoTransacional(
    idcarrinho: number,
    t: Transaction
  ): Promise<void> {
    try {
      // 1. Remove todos os itens do carrinho (CarrinhoItem)
      await CarrinhoItem.destroy({
        where: { carrinho_idcarrinho: idcarrinho },
        transaction: t,
      });

      // 2. Zera o total do carrinho principal (Carrinho)
      await Carrinho.update(
        { total: 0.0 },
        { where: { idcarrinho }, transaction: t }
      );
    } catch (error) {
      console.error("❌ Erro ao limpar carrinho transacional:", error);
      throw error;
    }
  }
}

export default new CarrinhoService();
