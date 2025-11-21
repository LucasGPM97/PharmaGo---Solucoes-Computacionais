import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import EnderecoEstabelecimentoService from "../../src/services/EnderecoEstabelecimentoService";

jest.mock("../../src/services/EnderecoEstabelecimentoService");

jest.mock("../../src/middlewares/authMiddleware", () => {
  return (req: any, res: any, next: any) => {
    req.user = { id: 1, tipo: "estabelecimento" };
    next();
  };
});

const mockEnderecoEstabelecimentoService =
  EnderecoEstabelecimentoService as jest.Mocked<
    typeof EnderecoEstabelecimentoService
  >;

describe("EnderecoEstabelecimentoController - Testes de Integração", () => {
  const mockDate = new Date().toISOString();

  const mockEnderecoEstabelecimento = {
    idendereco_estabelecimento: 1,
    estabelecimento_idestabelecimento: 1,
    uf: "SP",
    logradouro: "Av. Paulista",
    numero: "1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "São Paulo",
    cep: "01310-100",
    latitude: "-23.563099",
    longitude: "-46.654279",
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // --- CREATE ENDERECO ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("POST /enderecos_estabelecimento", () => {
    it("deve retornar 201 e criar um novo endereço do estabelecimento", async () => {
      const newEnderecoData = {
        estabelecimento_idestabelecimento: 1,
        uf: "SP",
        logradouro: "Av. Paulista",
        numero: "1000",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "São Paulo",
        cep: "01310-100",
        latitude: "-23.563099",
        longitude: "-46.654279",
      };

      mockEnderecoEstabelecimentoService.createEndereco.mockResolvedValue(
        mockEnderecoEstabelecimento as any
      );

      const response = await request(app as Application)
        .post("/enderecos_estabelecimento")
        .send(newEnderecoData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockEnderecoEstabelecimento);
      expect(
        mockEnderecoEstabelecimentoService.createEndereco
      ).toHaveBeenCalledWith(newEnderecoData);
    });

    it("deve retornar 400 em caso de erro na criação", async () => {
      const invalidData = {
        estabelecimento_idestabelecimento: 1,
      };

      mockEnderecoEstabelecimentoService.createEndereco.mockRejectedValue(
        new Error("Dados inválidos")
      );

      const response = await request(app as Application)
        .post("/enderecos_estabelecimento")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Dados inválidos");
    });
  });

  // -------------------------------------------------------------------
  // --- GET ENDERECO BY ID
  // -------------------------------------------------------------------

  describe("GET /enderecos_estabelecimento/:idendereco_estabelecimento", () => {
    it("deve retornar 200 e endereço quando encontrado", async () => {
      mockEnderecoEstabelecimentoService.getEnderecoById.mockResolvedValue(
        mockEnderecoEstabelecimento as any
      );

      const response = await request(app as Application).get(
        "/enderecos_estabelecimento/1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEnderecoEstabelecimento);
      expect(
        mockEnderecoEstabelecimentoService.getEnderecoById
      ).toHaveBeenCalledWith(1);
    });

    it("deve retornar 404 quando endereço não for encontrado", async () => {
      mockEnderecoEstabelecimentoService.getEnderecoById.mockResolvedValue(
        null
      );

      const response = await request(app as Application).get(
        "/enderecos_estabelecimento/999"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("EnderecoEstabelecimento not found");
    });
  });

  // -------------------------------------------------------------------
  // --- GET ENDERECOS BY ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("GET /enderecos_estabelecimento/estabelecimento/:idestabelecimento", () => {
    it("deve retornar 200 e lista de endereços do estabelecimento", async () => {
      const enderecosList = [
        mockEnderecoEstabelecimento,
        {
          ...mockEnderecoEstabelecimento,
          idendereco_estabelecimento: 2,
          logradouro: "Rua Augusta",
        },
      ];

      mockEnderecoEstabelecimentoService.getAllEnderecosByEstabelecimento.mockResolvedValue(
        enderecosList as any
      );

      const response = await request(app as Application).get(
        "/enderecos_estabelecimento/estabelecimento/1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(enderecosList);
      expect(
        mockEnderecoEstabelecimentoService.getAllEnderecosByEstabelecimento
      ).toHaveBeenCalledWith(1);
    });

    it("deve retornar 400 em caso de erro", async () => {
      mockEnderecoEstabelecimentoService.getAllEnderecosByEstabelecimento.mockRejectedValue(
        new Error("Erro de consulta")
      );

      const response = await request(app as Application).get(
        "/enderecos_estabelecimento/estabelecimento/1"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de consulta");
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE ENDERECO
  // -------------------------------------------------------------------

  describe("PUT /enderecos_estabelecimento/:idendereco_estabelecimento", () => {
    it("deve retornar 200 e endereço atualizado", async () => {
      const updateData = {
        logradouro: "Av. Paulista Atualizada",
        numero: "2000",
      };
      const updatedEndereco = {
        ...mockEnderecoEstabelecimento,
        ...updateData,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockEnderecoEstabelecimentoService.updateEndereco.mockResolvedValue([
        1,
        [updatedEndereco] as any,
      ]);
      mockEnderecoEstabelecimentoService.getEnderecoById.mockResolvedValue(
        updatedEndereco as any
      );

      const response = await request(app as Application)
        .put("/enderecos_estabelecimento/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedEndereco);
      expect(
        mockEnderecoEstabelecimentoService.updateEndereco
      ).toHaveBeenCalledWith(1, updateData);
    });

    it("deve retornar 404 quando endereço não for encontrado para atualização", async () => {
      mockEnderecoEstabelecimentoService.updateEndereco.mockResolvedValue([
        0,
        [],
      ]);

      const response = await request(app as Application)
        .put("/enderecos_estabelecimento/999")
        .send({ logradouro: "Endereço Atualizado" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("EnderecoEstabelecimento not found");
    });

    it("deve retornar 400 em caso de erro na atualização", async () => {
      mockEnderecoEstabelecimentoService.updateEndereco.mockRejectedValue(
        new Error("Erro de atualização")
      );

      const response = await request(app as Application)
        .put("/enderecos_estabelecimento/1")
        .send({ logradouro: "Endereço Atualizado" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de atualização");
    });
  });

  // -------------------------------------------------------------------
  // --- DELETE ENDERECO
  // -------------------------------------------------------------------

  describe("DELETE /enderecos_estabelecimento/:idendereco_estabelecimento", () => {
    it("deve retornar 204 ao deletar endereço com sucesso", async () => {
      mockEnderecoEstabelecimentoService.deleteEndereco.mockResolvedValue(1);

      const response = await request(app as Application).delete(
        "/enderecos_estabelecimento/1"
      );

      expect(response.status).toBe(204);
      expect(
        mockEnderecoEstabelecimentoService.deleteEndereco
      ).toHaveBeenCalledWith(1);
    });

    it("deve retornar 404 quando endereço não for encontrado para deleção", async () => {
      mockEnderecoEstabelecimentoService.deleteEndereco.mockResolvedValue(0);

      const response = await request(app as Application).delete(
        "/enderecos_estabelecimento/999"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("EnderecoEstabelecimento not found");
    });

    it("deve retornar 400 em caso de erro na deleção", async () => {
      mockEnderecoEstabelecimentoService.deleteEndereco.mockRejectedValue(
        new Error("Erro de deleção")
      );

      const response = await request(app as Application).delete(
        "/enderecos_estabelecimento/1"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de deleção");
    });
  });
});
