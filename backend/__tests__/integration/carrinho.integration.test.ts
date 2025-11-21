import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import CarrinhoService from "../../src/services/CarrinhoService";

jest.mock("../../src/services/CarrinhoService");

jest.mock("../../src/middlewares/authMiddleware", () => {
  return (req: any, res: any, next: any) => {
    req.userId = 1;
    req.userType = "cliente";
    req.userEmail = "cliente@test.com";
    next();
  };
});

const mockCarrinhoService = CarrinhoService as jest.Mocked<
  typeof CarrinhoService
>;

describe("CarrinhoController - Testes de Integração", () => {
  const mockCarrinho = {
    idcarrinho: 1,
    cliente_idcliente: 1,
    total: 100.0,
    carrinho_item: [
      {
        idcarrinho_item: 1,
        carrinho_idcarrinho: 1,
        catalogo_produto_idcatalogo_produto: 1,
        quantidade: 2,
        catalogo_produto: {
          valor_venda: 50.0,
          catalogo: {
            estabelecimento: {
              idestabelecimento: 1,
              razao_social: "Farmácia Teste",
              taxa_entrega: 5.0,
              valor_minimo_entrega: 15.0,
            },
          },
          produto: {
            idproduto: 1,
            nome_comercial: "Produto Teste",
          },
        },
      },
    ],
  };

  const mockCarrinhoItem = {
    idcarrinho_item: 1,
    carrinho_idcarrinho: 1,
    catalogo_produto_idcatalogo_produto: 1,
    quantidade: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // --- GET CARRINHO
  // -------------------------------------------------------------------

  describe("GET /carrinho/:idcliente", () => {
    it("deve retornar 200 e carrinho com itens", async () => {
      mockCarrinhoService.getOrCreateCarrinho.mockResolvedValue(
        mockCarrinho as any
      );
      mockCarrinhoService.getCarrinhoCompleto.mockResolvedValue(
        mockCarrinho as any
      );

      const response = await request(app as Application).get("/carrinho/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCarrinho);
      expect(mockCarrinhoService.getOrCreateCarrinho).toHaveBeenCalledWith(1);
      expect(mockCarrinhoService.getCarrinhoCompleto).toHaveBeenCalledWith(1);
    });

    it("deve retornar 404 quando carrinho não for encontrado após criação", async () => {
      mockCarrinhoService.getOrCreateCarrinho.mockResolvedValue(
        mockCarrinho as any
      );
      mockCarrinhoService.getCarrinhoCompleto.mockResolvedValue(null);

      const response = await request(app as Application).get("/carrinho/1");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Carrinho não encontrado após criação."
      );
    });

    it("deve retornar 400 em caso de erro", async () => {
      mockCarrinhoService.getOrCreateCarrinho.mockRejectedValue(
        new Error("Erro de banco")
      );

      const response = await request(app as Application).get("/carrinho/1");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de banco");
    });
  });

  // -------------------------------------------------------------------
  // --- ADD ITEM
  // -------------------------------------------------------------------

  describe("POST /carrinho/:idcarrinho/item", () => {
    it("deve retornar 201 e adicionar item ao carrinho", async () => {
      mockCarrinhoService.addItemToCarrinho.mockResolvedValue(
        mockCarrinhoItem as any
      );

      const itemData = {
        idcatalogo_produto: 1,
        quantidade: 2,
      };

      const response = await request(app as Application)
        .post("/carrinho/1/item")
        .send(itemData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCarrinhoItem);
      expect(mockCarrinhoService.addItemToCarrinho).toHaveBeenCalledWith(
        1,
        1,
        2
      );
    });

    it("deve retornar 400 quando dados estiverem faltando", async () => {
      const invalidData = {};

      const response = await request(app as Application)
        .post("/carrinho/1/item")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Dados do item (idcatalogo_produto e quantidade) são obrigatórios."
      );
    });

    it("deve retornar 400 em caso de erro ao adicionar item", async () => {
      mockCarrinhoService.addItemToCarrinho.mockRejectedValue(
        new Error("Produto não encontrado")
      );

      const response = await request(app as Application)
        .post("/carrinho/1/item")
        .send({ idcatalogo_produto: 999, quantidade: 1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Produto não encontrado");
    });
  });

  // -------------------------------------------------------------------
  // --- REMOVE ITEM
  // -------------------------------------------------------------------

  describe("DELETE /carrinho/:idcarrinho/item/:idproduto", () => {
    it("deve retornar 204 ao remover item com sucesso", async () => {
      mockCarrinhoService.removeItemFromCarrinho.mockResolvedValue(1);

      const response = await request(app as Application).delete(
        "/carrinho/1/item/1"
      );

      expect(response.status).toBe(204);
      expect(mockCarrinhoService.removeItemFromCarrinho).toHaveBeenCalledWith(
        1,
        1
      );
    });

    it("deve retornar 404 quando item não for encontrado", async () => {
      mockCarrinhoService.removeItemFromCarrinho.mockResolvedValue(0);

      const response = await request(app as Application).delete(
        "/carrinho/1/item/999"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Item not found in carrinho");
    });

    it("deve retornar 400 em caso de erro", async () => {
      mockCarrinhoService.removeItemFromCarrinho.mockRejectedValue(
        new Error("Erro de remoção")
      );

      const response = await request(app as Application).delete(
        "/carrinho/1/item/1"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de remoção");
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE ITEM QUANTITY
  // -------------------------------------------------------------------

  describe("PUT /carrinho/:idcarrinho/item/:idproduto", () => {
    it("deve retornar 200 e atualizar quantidade do item", async () => {
      mockCarrinhoService.updateCarrinhoItemQuantity.mockResolvedValue([
        1,
        [mockCarrinhoItem] as any,
      ]);
      mockCarrinhoService.getCarrinhoComItens.mockResolvedValue(
        mockCarrinho as any
      );

      const updateData = { quantidade: 5 };

      const response = await request(app as Application)
        .put("/carrinho/1/item/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCarrinho);
      expect(
        mockCarrinhoService.updateCarrinhoItemQuantity
      ).toHaveBeenCalledWith(1, 1, 5);
    });

    it("deve retornar 404 quando item não for encontrado", async () => {
      mockCarrinhoService.updateCarrinhoItemQuantity.mockResolvedValue([0, []]);

      const response = await request(app as Application)
        .put("/carrinho/1/item/999")
        .send({ quantidade: 5 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Item não encontrado no carrinho");
    });

    it("deve retornar 400 em caso de erro", async () => {
      mockCarrinhoService.updateCarrinhoItemQuantity.mockRejectedValue(
        new Error("Erro de atualização")
      );

      const response = await request(app as Application)
        .put("/carrinho/1/item/1")
        .send({ quantidade: 5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de atualização");
    });
  });

  // -------------------------------------------------------------------
  // --- CLEAR CARRINHO
  // -------------------------------------------------------------------

  describe("DELETE /carrinho/:idcarrinho", () => {
    it("deve retornar 204 ao limpar carrinho com sucesso", async () => {
      mockCarrinhoService.clearCarrinho.mockResolvedValue(3);

      const response = await request(app as Application).delete("/carrinho/1");

      expect(response.status).toBe(204);
      expect(mockCarrinhoService.clearCarrinho).toHaveBeenCalledWith(1);
    });

    it("deve retornar 400 em caso de erro", async () => {
      mockCarrinhoService.clearCarrinho.mockRejectedValue(
        new Error("Erro ao limpar carrinho")
      );

      const response = await request(app as Application).delete("/carrinho/1");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro ao limpar carrinho");
    });
  });
});
