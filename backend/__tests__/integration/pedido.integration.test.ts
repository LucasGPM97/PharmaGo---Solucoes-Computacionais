import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import PedidoService from "../../src/services/PedidoService";

jest.mock("../../src/services/PedidoService");

jest.mock("../../src/middlewares/authMiddleware", () => {
  return (req: any, res: any, next: any) => {
    req.user = { id: 1, tipo: "cliente" };
    next();
  };
});

const mockPedidoService = PedidoService as jest.Mocked<typeof PedidoService>;

describe("PedidoController - Testes de Integração", () => {
  const mockDate = new Date().toISOString();

  const mockPedido = {
    idpedido: 1,
    cliente_idcliente: 1,
    estabelecimento_idestabelecimento: 1,
    endereco_cliente_idendereco_cliente: 1,
    forma_pagamento_idforma_pagamento: 1,
    data_pedido: mockDate,
    status: "Aguardando Pagamento",
    valor_total: 150.5,
    observacoes: "Entregar após as 18h",
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // --- CREATE PEDIDO (CHECKOUT)
  // -------------------------------------------------------------------

  describe("POST /pedidos", () => {
    it("deve retornar 201 e criar um novo pedido do carrinho", async () => {
      const checkoutData = {
        idcarrinho: 1,
        cliente_idcliente: 1,
        endereco_cliente_idendereco_cliente: 1,
        forma_pagamento_idforma_pagamento: 1,
        observacoes: "Entregar após as 18h",
      };

      mockPedidoService.criarPedidoDoCarrinho.mockResolvedValue(
        mockPedido as any
      );

      const response = await request(app as Application)
        .post("/pedidos")
        .send(checkoutData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        idpedido: mockPedido.idpedido,
        message: "Pedido criado e carrinho limpo com sucesso.",
      });
      expect(mockPedidoService.criarPedidoDoCarrinho).toHaveBeenCalledWith(
        1,
        1,
        {
          endereco_cliente_idendereco_cliente: 1,
          forma_pagamento_idforma_pagamento: 1,
          observacoes: "Entregar após as 18h",
        }
      );
    });

    it("deve retornar 400 quando dados de checkout estiverem incompletos", async () => {
      const invalidData = {
        idcarrinho: 1,
      };

      const response = await request(app as Application)
        .post("/pedidos")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Dados de checkout incompletos");
    });

    it("deve retornar 400 em caso de erro no checkout", async () => {
      const checkoutData = {
        idcarrinho: 1,
        cliente_idcliente: 1,
        endereco_cliente_idendereco_cliente: 1,
        forma_pagamento_idforma_pagamento: 1,
      };

      mockPedidoService.criarPedidoDoCarrinho.mockRejectedValue(
        new Error("Erro no checkout")
      );

      const response = await request(app as Application)
        .post("/pedidos")
        .send(checkoutData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro no checkout");
    });
  });

  // -------------------------------------------------------------------
  // --- GET PEDIDO BY ID
  // -------------------------------------------------------------------

  describe("GET /pedidos/:idpedido", () => {
    it("deve retornar 200 e pedido quando encontrado", async () => {
      mockPedidoService.getPedidoById.mockResolvedValue(mockPedido as any);

      const response = await request(app as Application).get("/pedidos/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPedido);
      expect(mockPedidoService.getPedidoById).toHaveBeenCalledWith(1);
    });

    it("deve retornar 404 quando pedido não for encontrado", async () => {
      mockPedidoService.getPedidoById.mockResolvedValue(null);

      const response = await request(app as Application).get("/pedidos/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Pedido não encontrado");
    });

    it("deve retornar 400 quando ID for inválido", async () => {
      const response = await request(app as Application).get("/pedidos/abc");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "ID do pedido inválido ou não fornecido"
      );
    });

    it("deve retornar 400 em caso de erro interno", async () => {
      mockPedidoService.getPedidoById.mockRejectedValue(
        new Error("Erro de banco")
      );

      const response = await request(app as Application).get("/pedidos/1");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de banco");
    });
  });

  // -------------------------------------------------------------------
  // --- GET PEDIDOS BY CLIENTE
  // -------------------------------------------------------------------

  describe("GET /pedidos/cliente/:cliente_idcliente", () => {
    it("deve retornar 200 e lista de pedidos do cliente", async () => {
      const pedidosList = [
        mockPedido,
        { ...mockPedido, idpedido: 2, status: "Entregue" },
      ];

      mockPedidoService.getAllPedidosByCliente.mockResolvedValue(
        pedidosList as any
      );

      const response = await request(app as Application).get(
        "/pedidos/cliente/1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(pedidosList);
      expect(mockPedidoService.getAllPedidosByCliente).toHaveBeenCalledWith(1);
    });

    it("deve retornar 400 em caso de erro", async () => {
      mockPedidoService.getAllPedidosByCliente.mockRejectedValue(
        new Error("Erro de consulta")
      );

      const response = await request(app as Application).get(
        "/pedidos/cliente/1"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de consulta");
    });
  });

  // -------------------------------------------------------------------
  // --- GET PEDIDOS BY ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("GET /pedidos/estabelecimento/:estabelecimento_idestabelecimento", () => {
    it("deve retornar 200 e lista de pedidos do estabelecimento", async () => {
      const pedidosList = [
        mockPedido,
        { ...mockPedido, idpedido: 2, status: "Preparando" },
      ];

      mockPedidoService.getAllPedidosByEstabelecimento.mockResolvedValue(
        pedidosList as any
      );

      const response = await request(app as Application).get(
        "/pedidos/estabelecimento/1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(pedidosList);
      expect(
        mockPedidoService.getAllPedidosByEstabelecimento
      ).toHaveBeenCalledWith(1);
    });

    it("deve retornar 400 em caso de erro", async () => {
      mockPedidoService.getAllPedidosByEstabelecimento.mockRejectedValue(
        new Error("Erro de consulta")
      );

      const response = await request(app as Application).get(
        "/pedidos/estabelecimento/1"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de consulta");
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE PEDIDO
  // -------------------------------------------------------------------

  describe("PUT /pedidos/:idpedido", () => {
    it("deve retornar 200 e pedido atualizado", async () => {
      const updateData = {
        status: "Confirmado",
        observacoes: "Pedido confirmado",
      };
      const updatedPedido = {
        ...mockPedido,
        ...updateData,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockPedidoService.updatePedido.mockResolvedValue([
        1,
        [updatedPedido] as any,
      ]);
      mockPedidoService.getPedidoById.mockResolvedValue(updatedPedido as any);

      const response = await request(app as Application)
        .put("/pedidos/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedPedido);
      expect(mockPedidoService.updatePedido).toHaveBeenCalledWith(
        1,
        updateData
      );
    });

    it("deve retornar 404 quando pedido não for encontrado para atualização", async () => {
      mockPedidoService.updatePedido.mockResolvedValue([0, []]);

      const response = await request(app as Application)
        .put("/pedidos/999")
        .send({ status: "Confirmado" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Pedido not found");
    });

    it("deve retornar 400 em caso de erro na atualização", async () => {
      mockPedidoService.updatePedido.mockRejectedValue(
        new Error("Erro de atualização")
      );

      const response = await request(app as Application)
        .put("/pedidos/1")
        .send({ status: "Confirmado" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de atualização");
    });
  });

  // -------------------------------------------------------------------
  // --- DELETE PEDIDO
  // -------------------------------------------------------------------

  describe("DELETE /pedidos/:idpedido", () => {
    it("deve retornar 204 ao deletar pedido com sucesso", async () => {
      mockPedidoService.deletePedido.mockResolvedValue(1);

      const response = await request(app as Application).delete("/pedidos/1");

      expect(response.status).toBe(204);
      expect(mockPedidoService.deletePedido).toHaveBeenCalledWith(1);
    });

    it("deve retornar 404 quando pedido não for encontrado para deleção", async () => {
      mockPedidoService.deletePedido.mockResolvedValue(0);

      const response = await request(app as Application).delete("/pedidos/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Pedido not found");
    });

    it("deve retornar 400 em caso de erro na deleção", async () => {
      mockPedidoService.deletePedido.mockRejectedValue(
        new Error("Erro de deleção")
      );

      const response = await request(app as Application).delete("/pedidos/1");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de deleção");
    });
  });
});
