import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import EstabelecimentoService from "../../src/services/EstabelecimentoService";

jest.mock("../../src/services/EstabelecimentoService");

jest.mock("../../src/middlewares/authMiddleware", () => {
  return (req: any, res: any, next: any) => {
    req.userId = 1;
    req.userType = "estabelecimento";
    req.userEmail = "test@estabelecimento.com";
    next();
  };
});

const mockEstabelecimentoService = EstabelecimentoService as jest.Mocked<
  typeof EstabelecimentoService
>;

describe("EstabelecimentoController - Testes de Integração", () => {
  const mockDate = new Date().toISOString();

  const mockEstabelecimento = {
    idestabelecimento: 1,
    cnpj: "12345678000100",
    email: "test@farmacia.com",
    razao_social: "Farmácia Teste LTDA",
    registro_anvisa: "123456",
    responsavel_tecnico: "Responsável Teste",
    telefone_contato: "11999999999",
    conta_bancaria: "12345-6",
    raio_cobertura: 10.5,
    valor_minimo_entrega: 15.0,
    taxa_entrega: 5.0,
    logo_url: "http://logo.com/logo.jpg",
    senha: "hashedpassword",
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // --- CREATE ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("POST /estabelecimentos", () => {
    it("deve retornar 201 e criar um novo estabelecimento", async () => {
      const newEstabelecimentoData = {
        cnpj: "12345678000100",
        email: "novo@farmacia.com",
        razao_social: "Nova Farmácia LTDA",
        registro_anvisa: "654321",
        responsavel_tecnico: "Novo Responsável",
        telefone_contato: "11888888888",
        conta_bancaria: "54321-0",
        raio_cobertura: 8.0,
        valor_minimo_entrega: 20.0,
        taxa_entrega: 3.5,
        logo_url: "novo-logo.jpg",
        senha: "password123",
      };

      mockEstabelecimentoService.createEstabelecimento.mockResolvedValue(
        mockEstabelecimento as any
      );

      const response = await request(app as Application)
        .post("/estabelecimentos")
        .send(newEstabelecimentoData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockEstabelecimento);
      expect(
        mockEstabelecimentoService.createEstabelecimento
      ).toHaveBeenCalledWith(newEstabelecimentoData);
    });

    it("deve retornar 400 em caso de erro na criação", async () => {
      const invalidData = {
        cnpj: "12345678000100",
      };

      mockEstabelecimentoService.createEstabelecimento.mockRejectedValue(
        new Error("Dados inválidos")
      );

      const response = await request(app as Application)
        .post("/estabelecimentos")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Dados inválidos");
    });
  });

  // -------------------------------------------------------------------
  // --- GET ESTABELECIMENTO BY ID
  // -------------------------------------------------------------------

  describe("GET /estabelecimentos/:idestabelecimento", () => {
    it("deve retornar 200 e estabelecimento quando encontrado", async () => {
      mockEstabelecimentoService.getEstabelecimentoById.mockResolvedValue(
        mockEstabelecimento as any
      );

      const response = await request(app as Application).get(
        "/estabelecimentos/1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEstabelecimento);
      expect(
        mockEstabelecimentoService.getEstabelecimentoById
      ).toHaveBeenCalledWith(1);
    });

    it("deve retornar 404 quando estabelecimento não for encontrado", async () => {
      mockEstabelecimentoService.getEstabelecimentoById.mockResolvedValue(null);

      const response = await request(app as Application).get(
        "/estabelecimentos/999"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Estabelecimento não encontrado");
    });

    it("deve retornar 400 quando ID for inválido", async () => {
      const response = await request(app as Application).get(
        "/estabelecimentos/abc"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("ID do estabelecimento inválido");
    });

    it("deve retornar 500 em caso de erro interno", async () => {
      mockEstabelecimentoService.getEstabelecimentoById.mockRejectedValue(
        new Error("Erro de banco")
      );

      const response = await request(app as Application).get(
        "/estabelecimentos/1"
      );

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Erro interno do servidor");
    });
  });

  // -------------------------------------------------------------------
  // --- GET ALL ESTABELECIMENTOS
  // -------------------------------------------------------------------

  describe("GET /estabelecimentos", () => {
    it("deve retornar 200 e lista de estabelecimentos", async () => {
      const estabelecimentosList = [
        mockEstabelecimento,
        { ...mockEstabelecimento, idestabelecimento: 2 },
      ];

      mockEstabelecimentoService.getAllEstabelecimentos.mockResolvedValue(
        estabelecimentosList as any
      );

      const response = await request(app as Application).get(
        "/estabelecimentos"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(estabelecimentosList);
      expect(
        mockEstabelecimentoService.getAllEstabelecimentos
      ).toHaveBeenCalled();
    });

    it("deve retornar 400 em caso de erro", async () => {
      mockEstabelecimentoService.getAllEstabelecimentos.mockRejectedValue(
        new Error("Erro de consulta")
      );

      const response = await request(app as Application).get(
        "/estabelecimentos"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de consulta");
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("PUT /estabelecimentos/:idestabelecimento", () => {
    it("deve retornar 200 e estabelecimento atualizado", async () => {
      const updateData = { razao_social: "Nova Razão Social Atualizada" };
      const updatedEstabelecimento = {
        ...mockEstabelecimento,
        ...updateData,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockEstabelecimentoService.updateEstabelecimento.mockResolvedValue([
        1,
        [updatedEstabelecimento] as any,
      ]);
      mockEstabelecimentoService.getEstabelecimentoById.mockResolvedValue(
        updatedEstabelecimento as any
      );

      const response = await request(app as Application)
        .put("/estabelecimentos/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedEstabelecimento);
      expect(
        mockEstabelecimentoService.updateEstabelecimento
      ).toHaveBeenCalledWith(1, updateData);
    });

    it("deve retornar 404 quando estabelecimento não for encontrado para atualização", async () => {
      mockEstabelecimentoService.updateEstabelecimento.mockResolvedValue([
        0,
        [],
      ]);

      const response = await request(app as Application)
        .put("/estabelecimentos/999")
        .send({ razao_social: "Nova Razão" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Estabelecimento not found");
    });

    it("deve retornar 400 em caso de erro na atualização", async () => {
      mockEstabelecimentoService.updateEstabelecimento.mockRejectedValue(
        new Error("Erro de atualização")
      );

      const response = await request(app as Application)
        .put("/estabelecimentos/1")
        .send({ razao_social: "Nova Razão" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de atualização");
    });
  });

  // -------------------------------------------------------------------
  // --- DELETE ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("DELETE /estabelecimentos/:idestabelecimento", () => {
    it("deve retornar 204 ao deletar estabelecimento com sucesso", async () => {
      mockEstabelecimentoService.deleteEstabelecimento.mockResolvedValue(1);

      const response = await request(app as Application).delete(
        "/estabelecimentos/1"
      );

      expect(response.status).toBe(204);
      expect(
        mockEstabelecimentoService.deleteEstabelecimento
      ).toHaveBeenCalledWith(1);
    });

    it("deve retornar 404 quando estabelecimento não for encontrado para deleção", async () => {
      mockEstabelecimentoService.deleteEstabelecimento.mockResolvedValue(0);

      const response = await request(app as Application).delete(
        "/estabelecimentos/999"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Estabelecimento not found");
    });

    it("deve retornar 400 em caso de erro na deleção", async () => {
      mockEstabelecimentoService.deleteEstabelecimento.mockRejectedValue(
        new Error("Erro de deleção")
      );

      const response = await request(app as Application).delete(
        "/estabelecimentos/1"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de deleção");
    });
  });
});
