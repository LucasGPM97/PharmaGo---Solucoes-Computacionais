// Mock COMPLETO de TODOS os modelos ANTES de qualquer import
jest.mock("../../src/models/Pedido", () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../../src/models/PedidoItem", () => ({
  bulkCreate: jest.fn(),
}));

jest.mock("../../src/models/CatalogoProduto", () => ({}));

jest.mock("../../src/models/Produto", () => ({}));

jest.mock("../../src/models/Carrinho", () => ({}));

jest.mock("../../src/models/Estabelecimento", () => ({}));

jest.mock("../../src/models/EnderecoCliente", () => ({}));

jest.mock("../../src/models/FormaPagamento", () => ({}));

jest.mock("../../src/models/Cliente", () => ({}));

jest.mock("../../src/models/Catalogo", () => ({}));

jest.mock("../../src/services/CarrinhoService", () => ({
  getCarrinhoCompleto: jest.fn(),
  limparCarrinhoTransacional: jest.fn(),
  getOrCreateCarrinho: jest.fn(),
  updateCarrinhoTotal: jest.fn(),
  getCarrinhoComItens: jest.fn(),
  addItemToCarrinho: jest.fn(),
  removeItemFromCarrinho: jest.fn(),
  updateCarrinhoItemQuantity: jest.fn(),
  clearCarrinho: jest.fn(),
  getItensParaCheckout: jest.fn(),
}));

jest.mock("../../src/config/database", () => ({
  transaction: jest.fn(),
}));

import PedidoService from "../../src/services/PedidoService";

const mockPedido = require("../../src/models/Pedido");
const mockPedidoItem = require("../../src/models/PedidoItem");
const mockCarrinhoService = require("../../src/services/CarrinhoService");
const mockSequelize = require("../../src/config/database");

describe("PedidoService", () => {
  const mockPedidoData = {
    idpedido: 1,
    cliente_idcliente: 1,
    estabelecimento_idestabelecimento: 1,
    endereco_cliente_idendereco_cliente: 1,
    forma_pagamento_idforma_pagamento: 1,
    data_pedido: new Date(),
    status: "Aguardando Pagamento",
    valor_total: 150.5,
    observacoes: "Entregar após as 18h",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCarrinhoCompleto = {
    idcarrinho: 1,
    cliente_idcliente: 1,
    total: 150.5,
    createdAt: new Date(),
    updatedAt: new Date(),
    carrinho_item: [
      {
        idcarrinho_item: 1,
        carrinho_idcarrinho: 1,
        catalogo_produto_idcatalogo_produto: 1,
        quantidade: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        catalogo_produto: {
          idcatalogo_produto: 1,
          valor_venda: "50.00",
          createdAt: new Date(),
          updatedAt: new Date(),
          catalogo: {
            idcatalogo: 1,
            estabelecimento_idestabelecimento: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            estabelecimento: {
              idestabelecimento: 1,
              razao_social: "Farmácia Teste",
              taxa_entrega: "10.00",
              valor_minimo_entrega: "100.00",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          produto: {
            idproduto: 1,
            nome_comercial: "Paracetamol",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    ],
  };

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
    LOCK: {},
    afterCommit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPedido.create.mockResolvedValue(mockPedidoData);
    mockPedido.findByPk.mockResolvedValue(mockPedidoData);
    mockPedido.findAll.mockResolvedValue([mockPedidoData]);
    mockPedido.update.mockResolvedValue([1, [mockPedidoData]]);
    mockPedido.destroy.mockResolvedValue(1);
    mockPedidoItem.bulkCreate.mockResolvedValue([]);
    mockCarrinhoService.getCarrinhoCompleto.mockResolvedValue(
      mockCarrinhoCompleto
    );
    mockCarrinhoService.limparCarrinhoTransacional.mockResolvedValue(undefined);
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  // -------------------------------------------------------------------
  // --- TESTES BÁSICOS
  // -------------------------------------------------------------------

  describe("createPedido", () => {
    it("deve criar pedido com sucesso", async () => {
      const pedidoData = {
        cliente_idcliente: 1,
        estabelecimento_idestabelecimento: 1,
        endereco_cliente_idendereco_cliente: 1,
        forma_pagamento_idforma_pagamento: 1,
        status: "Aguardando Pagamento",
        valor_total: 150.5,
      };

      const result = await PedidoService.createPedido(pedidoData);

      expect(mockPedido.create).toHaveBeenCalledWith(pedidoData);
      expect(result).toEqual(mockPedidoData);
    });
  });

  describe("getPedidoById", () => {
    it("deve retornar pedido quando encontrado", async () => {
      const result = await PedidoService.getPedidoById(1);

      expect(mockPedido.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(result).toEqual(mockPedidoData);
    });

    it("deve retornar null quando pedido não existe", async () => {
      mockPedido.findByPk.mockResolvedValueOnce(null);

      const result = await PedidoService.getPedidoById(999);

      expect(result).toBeNull();
    });
  });

  describe("getAllPedidosByCliente", () => {
    it("deve retornar pedidos do cliente", async () => {
      const result = await PedidoService.getAllPedidosByCliente(1);

      expect(mockPedido.findAll).toHaveBeenCalledWith({
        where: { cliente_idcliente: 1 },
        include: expect.any(Array),
      });
      expect(result).toEqual([mockPedidoData]);
    });
  });

  describe("getAllPedidosByEstabelecimento", () => {
    it("deve retornar pedidos do estabelecimento", async () => {
      const result = await PedidoService.getAllPedidosByEstabelecimento(1);

      expect(mockPedido.findAll).toHaveBeenCalledWith({
        where: { estabelecimento_idestabelecimento: 1 },
        include: expect.any(Array),
        order: [["data_pedido", "DESC"]],
      });
      expect(result).toEqual([mockPedidoData]);
    });
  });

  describe("updatePedido", () => {
    it("deve atualizar pedido com sucesso", async () => {
      const result = await PedidoService.updatePedido(1, {
        status: "Confirmado",
      });

      expect(mockPedido.update).toHaveBeenCalledWith(
        { status: "Confirmado" },
        { where: { idpedido: 1 }, returning: true }
      );
      expect(result).toEqual([1, [mockPedidoData]]);
    });
  });

  describe("deletePedido", () => {
    it("deve deletar pedido com sucesso", async () => {
      const result = await PedidoService.deletePedido(1);

      expect(mockPedido.destroy).toHaveBeenCalledWith({
        where: { idpedido: 1 },
      });
      expect(result).toBe(1);
    });
  });

  // -------------------------------------------------------------------
  // --- TESTES DE CHECKOUT
  // -------------------------------------------------------------------

  describe("criarPedidoDoCarrinho", () => {
    it("deve criar pedido do carrinho com sucesso", async () => {
      const dadosAdicionais = {
        endereco_cliente_idendereco_cliente: 1,
        forma_pagamento_idforma_pagamento: 1,
      };

      const result = await PedidoService.criarPedidoDoCarrinho(
        1,
        1,
        dadosAdicionais
      );

      expect(mockSequelize.transaction).toHaveBeenCalled();
      expect(mockCarrinhoService.getCarrinhoCompleto).toHaveBeenCalledWith(1);
      expect(mockPedido.create).toHaveBeenCalled();
      expect(mockPedidoItem.bulkCreate).toHaveBeenCalled();
      expect(
        mockCarrinhoService.limparCarrinhoTransacional
      ).toHaveBeenCalledWith(1, mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockPedidoData);
    });

    it("deve lançar erro quando carrinho estiver vazio", async () => {
      mockCarrinhoService.getCarrinhoCompleto.mockResolvedValueOnce({
        carrinho_item: [],
      });

      await expect(
        PedidoService.criarPedidoDoCarrinho(1, 1, {
          endereco_cliente_idendereco_cliente: 1,
          forma_pagamento_idforma_pagamento: 1,
        })
      ).rejects.toThrow(
        "O carrinho está vazio ou não existe para este cliente."
      );

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it("deve fazer rollback em caso de erro", async () => {
      mockPedido.create.mockRejectedValueOnce(new Error("Erro de banco"));

      await expect(
        PedidoService.criarPedidoDoCarrinho(1, 1, {
          endereco_cliente_idendereco_cliente: 1,
          forma_pagamento_idforma_pagamento: 1,
        })
      ).rejects.toThrow("Erro de banco");

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
