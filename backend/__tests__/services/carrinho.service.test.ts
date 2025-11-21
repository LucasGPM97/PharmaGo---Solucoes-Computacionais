import CarrinhoService from "../../src/services/CarrinhoService";
import Carrinho from "../../src/models/Carrinho";
import CarrinhoItem from "../../src/models/CarrinhoItem";
import CatalogoProduto from "../../src/models/CatalogoProduto";
import Catalogo from "../../src/models/Catalogo";
import Estabelecimento from "../../src/models/Estabelecimento";
import Produto from "../../src/models/Produto";

jest.mock("../../src/models/Carrinho");
jest.mock("../../src/models/CarrinhoItem");
jest.mock("../../src/models/CatalogoProduto");
jest.mock("../../src/models/Catalogo");
jest.mock("../../src/models/Estabelecimento");
jest.mock("../../src/models/Produto");

const mockCarrinho = Carrinho as jest.MockedClass<typeof Carrinho>;
const mockCarrinhoItem = CarrinhoItem as jest.MockedClass<typeof CarrinhoItem>;
const mockCatalogoProduto = CatalogoProduto as jest.MockedClass<
  typeof CatalogoProduto
>;
const mockCatalogo = Catalogo as jest.MockedClass<typeof Catalogo>;
const mockEstabelecimento = Estabelecimento as jest.MockedClass<
  typeof Estabelecimento
>;
const mockProduto = Produto as jest.MockedClass<typeof Produto>;

describe("CarrinhoService", () => {
  const mockCarrinhoData = {
    idcarrinho: 1,
    cliente_idcliente: 1,
    total: 100.0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCarrinhoItemData = {
    idcarrinho_item: 1,
    carrinho_idcarrinho: 1,
    catalogo_produto_idcatalogo_produto: 1,
    quantidade: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCatalogoProdutoData = {
    idcatalogo_produto: 1,
    valor_venda: 25.0,
    catalogo: {
      estabelecimento_idestabelecimento: 1,
    },
  };

  const mockCatalogoData = {
    idcatalogo: 1,
    estabelecimento_idestabelecimento: 1,
  };

  const mockItensCarrinho: any[] = [
    {
      idcarrinho_item: 1,
      quantidade: 2,
      catalogo_produto: {
        valor_venda: 25.0,
        toJSON: () => ({ valor_venda: 25.0 }),
      },
    },
    {
      idcarrinho_item: 2,
      quantidade: 1,
      catalogo_produto: {
        valor_venda: 15.0,
        toJSON: () => ({ valor_venda: 15.0 }),
      },
    },
  ];

  const mockItensCarrinhoVazio: any[] = [];

  beforeEach(() => {
    jest.clearAllMocks();

    (mockCarrinho.findOne as jest.Mock) = jest.fn();
    (mockCarrinho.create as jest.Mock) = jest.fn();
    (mockCarrinho.update as jest.Mock) = jest.fn();
    (mockCarrinhoItem.findAll as jest.Mock) = jest.fn();
    (mockCarrinhoItem.findOne as jest.Mock) = jest.fn();
    (mockCarrinhoItem.create as jest.Mock) = jest.fn();
    (mockCarrinhoItem.update as jest.Mock) = jest.fn();
    (mockCarrinhoItem.destroy as jest.Mock) = jest.fn();
    (mockCatalogoProduto.findByPk as jest.Mock) = jest.fn();
  });

  // -------------------------------------------------------------------
  // --- GET OR CREATE CARRINHO
  // -------------------------------------------------------------------

  describe("getOrCreateCarrinho", () => {
    it("deve retornar carrinho existente quando encontrado", async () => {
      (mockCarrinho.findOne as jest.Mock).mockResolvedValue(mockCarrinhoData);

      const result = await CarrinhoService.getOrCreateCarrinho(1);

      expect(mockCarrinho.findOne).toHaveBeenCalledWith({
        where: { cliente_idcliente: 1 },
      });
      expect(result).toEqual(mockCarrinhoData);
    });

    it("deve criar novo carrinho quando não existir", async () => {
      (mockCarrinho.findOne as jest.Mock).mockResolvedValue(null);
      (mockCarrinho.create as jest.Mock).mockResolvedValue(mockCarrinhoData);

      const result = await CarrinhoService.getOrCreateCarrinho(1);

      expect(mockCarrinho.create).toHaveBeenCalledWith({
        idcarrinho: 1,
        cliente_idcliente: 1,
        status: "ativo",
        total: 0.0,
      });
      expect(result).toEqual(mockCarrinhoData);
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE CARRINHO TOTAL
  // -------------------------------------------------------------------

  describe("updateCarrinhoTotal", () => {
    it("deve calcular e atualizar o total do carrinho corretamente", async () => {
      (mockCarrinhoItem.findAll as jest.Mock).mockResolvedValue(
        mockItensCarrinho
      );
      (mockCarrinho.update as jest.Mock).mockResolvedValue([1]);

      await CarrinhoService.updateCarrinhoTotal(1);

      expect(mockCarrinhoItem.findAll).toHaveBeenCalledWith({
        where: { carrinho_idcarrinho: 1 },
        include: [
          {
            model: CatalogoProduto,
            as: "catalogo_produto",
            attributes: ["valor_venda"],
          },
        ],
      });
      expect(mockCarrinho.update).toHaveBeenCalledWith(
        { total: 65.0 },
        { where: { idcarrinho: 1 } }
      );
    });

    it("deve atualizar total para 0 quando carrinho estiver vazio", async () => {
      (mockCarrinhoItem.findAll as jest.Mock).mockResolvedValue(
        mockItensCarrinhoVazio
      );
      (mockCarrinho.update as jest.Mock).mockResolvedValue([1]);

      await CarrinhoService.updateCarrinhoTotal(1);

      expect(mockCarrinho.update).toHaveBeenCalledWith(
        { total: 0.0 },
        { where: { idcarrinho: 1 } }
      );
    });
  });

  // -------------------------------------------------------------------
  // --- ADD ITEM TO CARRINHO
  // -------------------------------------------------------------------

  describe("addItemToCarrinho", () => {
    beforeEach(() => {
      (mockCarrinhoItem.findAll as jest.Mock).mockResolvedValue(
        mockItensCarrinho
      );
      (mockCarrinho.update as jest.Mock).mockResolvedValue([1]);
    });

    it("deve adicionar novo item ao carrinho", async () => {
      (mockCarrinhoItem.findAll as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockItensCarrinho);

      const mockCatalogoProdutoCompleto = {
        ...mockCatalogoProdutoData,
        catalogo: {
          estabelecimento_idestabelecimento: 1,
          toJSON: () => ({ estabelecimento_idestabelecimento: 1 }),
        },
        toJSON: () => mockCatalogoProdutoData,
      };

      (mockCatalogoProduto.findByPk as jest.Mock).mockResolvedValue(
        mockCatalogoProdutoCompleto
      );
      (mockCarrinhoItem.findOne as jest.Mock).mockResolvedValue(null);
      (mockCarrinhoItem.create as jest.Mock).mockResolvedValue(
        mockCarrinhoItemData
      );

      const result = await CarrinhoService.addItemToCarrinho(1, 1, 2);

      expect(mockCarrinhoItem.create).toHaveBeenCalledWith({
        carrinho_idcarrinho: 1,
        catalogo_produto_idcatalogo_produto: 1,
        quantidade: 2,
      });
      expect(result).toEqual(mockCarrinhoItemData);
    });

    it("deve incrementar quantidade quando item já existir no carrinho", async () => {
      const existingItem = {
        ...mockCarrinhoItemData,
        quantidade: 1,
        catalogo_produto_idcatalogo_produto: 1,
        save: jest
          .fn()
          .mockResolvedValue({ ...mockCarrinhoItemData, quantidade: 3 }),
      };

      (mockCarrinhoItem.findAll as jest.Mock)
        .mockResolvedValueOnce([existingItem])
        .mockResolvedValueOnce(mockItensCarrinho);

      const mockCatalogoProdutoExistente = {
        ...mockCatalogoProdutoData,
        catalogo: {
          estabelecimento_idestabelecimento: 1,
          toJSON: () => ({ estabelecimento_idestabelecimento: 1 }),
        },
        toJSON: () => mockCatalogoProdutoData,
      };

      (mockCatalogoProduto.findByPk as jest.Mock).mockResolvedValue(
        mockCatalogoProdutoExistente
      );
      (mockCarrinhoItem.findOne as jest.Mock).mockResolvedValue(existingItem);

      const result = await CarrinhoService.addItemToCarrinho(1, 1, 2);

      expect(existingItem.save).toHaveBeenCalled();
      expect(result.quantidade).toBe(3);
    });

    it("deve lançar erro ao tentar adicionar produto de estabelecimento diferente", async () => {
      const existingItem = {
        ...mockCarrinhoItemData,
        catalogo_produto_idcatalogo_produto: 2,
      };

      const mockCatalogoProdutoExistente = {
        ...mockCatalogoProdutoData,
        catalogo: {
          estabelecimento_idestabelecimento: 2,
          toJSON: () => ({ estabelecimento_idestabelecimento: 2 }),
        },
        toJSON: () => ({
          ...mockCatalogoProdutoData,
          catalogo: { estabelecimento_idestabelecimento: 2 },
        }),
      };

      const mockCatalogoProdutoNovo = {
        ...mockCatalogoProdutoData,
        catalogo: {
          estabelecimento_idestabelecimento: 1,
          toJSON: () => ({ estabelecimento_idestabelecimento: 1 }),
        },
        toJSON: () => ({
          ...mockCatalogoProdutoData,
          catalogo: { estabelecimento_idestabelecimento: 1 },
        }),
      };

      (mockCarrinhoItem.findAll as jest.Mock).mockResolvedValue([existingItem]);
      (mockCatalogoProduto.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockCatalogoProdutoExistente)
        .mockResolvedValueOnce(mockCatalogoProdutoNovo);

      await expect(CarrinhoService.addItemToCarrinho(1, 1, 2)).rejects.toThrow(
        "Não é possível adicionar produtos de estabelecimentos diferentes"
      );
    });
  });

  // -------------------------------------------------------------------
  // --- REMOVE ITEM FROM CARRINHO
  // -------------------------------------------------------------------

  describe("removeItemFromCarrinho", () => {
    beforeEach(() => {
      (mockCarrinhoItem.findAll as jest.Mock).mockResolvedValue(
        mockItensCarrinho
      );
      (mockCarrinho.update as jest.Mock).mockResolvedValue([1]);
    });

    it("deve remover item do carrinho com sucesso", async () => {
      (mockCarrinhoItem.destroy as jest.Mock).mockResolvedValue(1);

      const result = await CarrinhoService.removeItemFromCarrinho(1, 1);

      expect(mockCarrinhoItem.destroy).toHaveBeenCalledWith({
        where: {
          carrinho_idcarrinho: 1,
          catalogo_produto_idcatalogo_produto: 1,
        },
      });
      expect(result).toBe(1);
    });

    it("deve retornar 0 quando item não for encontrado", async () => {
      (mockCarrinhoItem.destroy as jest.Mock).mockResolvedValue(0);

      const result = await CarrinhoService.removeItemFromCarrinho(1, 999);

      expect(result).toBe(0);
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE CARRINHO ITEM QUANTITY
  // -------------------------------------------------------------------

  describe("updateCarrinhoItemQuantity", () => {
    beforeEach(() => {
      (mockCarrinhoItem.findAll as jest.Mock).mockResolvedValue(
        mockItensCarrinho
      );
      (mockCarrinho.update as jest.Mock).mockResolvedValue([1]);
    });

    it("deve atualizar quantidade do item com sucesso", async () => {
      (mockCarrinhoItem.update as jest.Mock).mockResolvedValue([
        1,
        [mockCarrinhoItemData],
      ]);

      const result = await CarrinhoService.updateCarrinhoItemQuantity(1, 1, 5);

      expect(mockCarrinhoItem.update).toHaveBeenCalledWith(
        { quantidade: 5 },
        {
          where: {
            carrinho_idcarrinho: 1,
            catalogo_produto_idcatalogo_produto: 1,
          },
          returning: true,
        }
      );
      expect(result).toEqual([1, [mockCarrinhoItemData]]);
    });

    it("deve retornar [0, []] quando item não for encontrado", async () => {
      (mockCarrinhoItem.update as jest.Mock).mockResolvedValue([0, []]);

      const result = await CarrinhoService.updateCarrinhoItemQuantity(
        1,
        999,
        5
      );

      expect(result).toEqual([0, []]);
    });
  });

  // -------------------------------------------------------------------
  // --- CLEAR CARRINHO
  // -------------------------------------------------------------------

  describe("clearCarrinho", () => {
    it("deve limpar todos os itens do carrinho", async () => {
      (mockCarrinhoItem.destroy as jest.Mock).mockResolvedValue(3);
      (mockCarrinho.update as jest.Mock).mockResolvedValue([1]);

      const result = await CarrinhoService.clearCarrinho(1);

      expect(mockCarrinhoItem.destroy).toHaveBeenCalledWith({
        where: { carrinho_idcarrinho: 1 },
      });
      expect(mockCarrinho.update).toHaveBeenCalledWith(
        { total: 0.0 },
        { where: { idcarrinho: 1 } }
      );
      expect(result).toBe(3);
    });

    it("deve retornar 0 quando carrinho já estiver vazio", async () => {
      (mockCarrinhoItem.destroy as jest.Mock).mockResolvedValue(0);

      const result = await CarrinhoService.clearCarrinho(1);

      expect(result).toBe(0);
    });
  });

  // -------------------------------------------------------------------
  // --- GET CARRINHO COMPLETO
  // -------------------------------------------------------------------

  describe("getCarrinhoCompleto", () => {
    it("deve retornar carrinho com itens e estabelecimento", async () => {
      const mockCarrinhoCompleto = {
        ...mockCarrinhoData,
        carrinho_item: [mockCarrinhoItemData],
      };

      (mockCarrinho.findOne as jest.Mock).mockResolvedValue(
        mockCarrinhoCompleto
      );

      const result = await CarrinhoService.getCarrinhoCompleto(1);

      expect(mockCarrinho.findOne).toHaveBeenCalledWith({
        where: { cliente_idcliente: 1 },
        include: [
          {
            model: CarrinhoItem,
            as: "carrinho_item",
            include: [
              {
                model: CatalogoProduto,
                as: "catalogo_produto",
                include: [
                  {
                    model: Catalogo,
                    as: "catalogo",
                    include: [
                      {
                        model: Estabelecimento,
                        as: "estabelecimento",
                        attributes: [
                          "idestabelecimento",
                          "razao_social",
                          "taxa_entrega",
                          "valor_minimo_entrega",
                        ],
                      },
                    ],
                  },
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
      expect(result).toEqual(mockCarrinhoCompleto);
    });

    it("deve retornar null quando carrinho não for encontrado", async () => {
      (mockCarrinho.findOne as jest.Mock).mockResolvedValue(null);

      const result = await CarrinhoService.getCarrinhoCompleto(999);

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------
  // --- GET ITENS PARA CHECKOUT
  // -------------------------------------------------------------------

  describe("getItensParaCheckout", () => {
    it("deve retornar itens do carrinho para checkout", async () => {
      const mockItensCheckout = [mockCarrinhoItemData];
      (mockCarrinhoItem.findAll as jest.Mock).mockResolvedValue(
        mockItensCheckout
      );

      const result = await CarrinhoService.getItensParaCheckout(1);

      expect(mockCarrinhoItem.findAll).toHaveBeenCalledWith({
        where: { carrinho_idcarrinho: 1 },
        include: [
          {
            model: CatalogoProduto,
            as: "catalogo_produto",
            attributes: ["valor_venda"],
            include: [
              {
                model: Catalogo,
                as: "catalogo",
                attributes: ["estabelecimento_idestabelecimento"],
              },
            ],
          },
        ],
      });
      expect(result).toEqual(mockItensCheckout);
    });
  });
});
