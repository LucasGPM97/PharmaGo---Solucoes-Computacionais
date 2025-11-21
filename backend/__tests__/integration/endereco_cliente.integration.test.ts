import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import EnderecoClienteService from "../../src/services/EnderecoClienteService";

jest.mock("../../src/services/EnderecoClienteService");

jest.mock("../../src/middlewares/authMiddleware", () => {
  return (req: any, res: any, next: any) => {
    req.user = { id: 1, tipo: "cliente" };
    next();
  };
});

const mockEnderecoClienteService = EnderecoClienteService as jest.Mocked<
  typeof EnderecoClienteService
>;

describe("EnderecoClienteController - Testes de Integração", () => {
  const mockDate = new Date().toISOString();

  const mockEnderecoCliente = {
    idendereco_cliente: 1,
    cliente_idcliente: 1,
    uf: "SP",
    nome_endereco: "Casa",
    logradouro: "Rua das Flores",
    numero: "123",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "São Paulo",
    cep: "01234-567",
    latitude: "-23.550520",
    longitude: "-46.633308",
    ativo: true,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // --- CREATE ENDERECO CLIENTE
  // -------------------------------------------------------------------

  describe("POST /enderecos_cliente", () => {
    it("deve retornar 201 e criar um novo endereço do cliente", async () => {
      const newEnderecoData = {
        cliente_idcliente: 1,
        uf: "SP",
        nome_endereco: "Casa",
        logradouro: "Rua das Flores",
        numero: "123",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "São Paulo",
        cep: "01234-567",
        latitude: "-23.550520",
        longitude: "-46.633308",
      };

      mockEnderecoClienteService.createEndereco.mockResolvedValue(
        mockEnderecoCliente as any
      );

      const response = await request(app as Application)
        .post("/enderecos_cliente")
        .send(newEnderecoData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockEnderecoCliente);
      expect(mockEnderecoClienteService.createEndereco).toHaveBeenCalledWith(
        newEnderecoData
      );
    });

    it("deve retornar 400 em caso de erro na criação", async () => {
      const invalidData = {
        cliente_idcliente: 1,
      };

      mockEnderecoClienteService.createEndereco.mockRejectedValue(
        new Error("Dados inválidos")
      );

      const response = await request(app as Application)
        .post("/enderecos_cliente")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Dados inválidos");
    });
  });

  // -------------------------------------------------------------------
  // --- GET ENDERECO BY ID
  // -------------------------------------------------------------------

  describe("GET /enderecos_cliente/:id", () => {
    it("deve retornar 200 e endereço quando encontrado", async () => {
      mockEnderecoClienteService.getEnderecoById.mockResolvedValue(
        mockEnderecoCliente as any
      );

      const response = await request(app as Application).get(
        "/enderecos_cliente/1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockEnderecoCliente);
      expect(mockEnderecoClienteService.getEnderecoById).toHaveBeenCalledWith(
        1
      );
    });

    it("deve retornar 404 quando endereço não for encontrado", async () => {
      mockEnderecoClienteService.getEnderecoById.mockResolvedValue(null);

      const response = await request(app as Application).get(
        "/enderecos_cliente/999"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("EnderecoCliente not found");
    });

    it("deve retornar 400 quando ID for inválido", async () => {
      const response = await request(app as Application).get(
        "/enderecos_cliente/abc"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("ID inválido");
    });

    it("deve retornar 400 em caso de erro interno", async () => {
      mockEnderecoClienteService.getEnderecoById.mockRejectedValue(
        new Error("Erro de banco")
      );

      const response = await request(app as Application).get(
        "/enderecos_cliente/1"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de banco");
    });
  });

  // -------------------------------------------------------------------
  // --- GET ENDERECOS BY CLIENTE
  // -------------------------------------------------------------------

  describe("GET /enderecos_cliente/cliente/:idcliente", () => {
    it("deve retornar 200 e lista de endereços do cliente", async () => {
      const enderecosList = [
        mockEnderecoCliente,
        {
          ...mockEnderecoCliente,
          idendereco_cliente: 2,
          nome_endereco: "Trabalho",
        },
      ];

      mockEnderecoClienteService.getAllEnderecosByCliente.mockResolvedValue(
        enderecosList as any
      );

      const response = await request(app as Application).get(
        "/enderecos_cliente/cliente/1"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(enderecosList);
      expect(
        mockEnderecoClienteService.getAllEnderecosByCliente
      ).toHaveBeenCalledWith(1);
    });

    it("deve retornar 400 quando ID do cliente for inválido", async () => {
      const response = await request(app as Application).get(
        "/enderecos_cliente/cliente/abc"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("ID do cliente inválido");
    });

    it("deve retornar 400 em caso de erro", async () => {
      mockEnderecoClienteService.getAllEnderecosByCliente.mockRejectedValue(
        new Error("Erro de consulta")
      );

      const response = await request(app as Application).get(
        "/enderecos_cliente/cliente/1"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de consulta");
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE ENDERECO
  // -------------------------------------------------------------------

  describe("PUT /enderecos_cliente/:id", () => {
    it("deve retornar 200 e endereço atualizado", async () => {
      const updateData = {
        nome_endereco: "Casa Atualizada",
        logradouro: "Rua Atualizada",
      };
      const updatedEndereco = {
        ...mockEnderecoCliente,
        ...updateData,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      mockEnderecoClienteService.updateEndereco.mockResolvedValue([
        1,
        [updatedEndereco] as any,
      ]);
      mockEnderecoClienteService.getEnderecoById.mockResolvedValue(
        updatedEndereco as any
      );

      const response = await request(app as Application)
        .put("/enderecos_cliente/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedEndereco);
      expect(mockEnderecoClienteService.updateEndereco).toHaveBeenCalledWith(
        1,
        updateData
      );
    });

    it("deve retornar 404 quando endereço não for encontrado para atualização", async () => {
      mockEnderecoClienteService.updateEndereco.mockResolvedValue([0, []]);

      const response = await request(app as Application)
        .put("/enderecos_cliente/999")
        .send({ nome_endereco: "Endereço Atualizado" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("EnderecoCliente not found");
    });

    it("deve retornar 400 em caso de erro na atualização", async () => {
      mockEnderecoClienteService.updateEndereco.mockRejectedValue(
        new Error("Erro de atualização")
      );

      const response = await request(app as Application)
        .put("/enderecos_cliente/1")
        .send({ nome_endereco: "Endereço Atualizado" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de atualização");
    });
  });

  // -------------------------------------------------------------------
  // --- DELETE ENDERECO
  // -------------------------------------------------------------------

  describe("DELETE /enderecos_cliente/:id", () => {
    it("deve retornar 200 ao desativar endereço com sucesso", async () => {
      mockEnderecoClienteService.deleteEndereco.mockResolvedValue(1);

      const response = await request(app as Application).delete(
        "/enderecos_cliente/1"
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Endereço desativado com sucesso.");
      expect(mockEnderecoClienteService.deleteEndereco).toHaveBeenCalledWith(1);
    });

    it("deve retornar 404 quando endereço não for encontrado para desativação", async () => {
      mockEnderecoClienteService.deleteEndereco.mockResolvedValue(0);

      const response = await request(app as Application).delete(
        "/enderecos_cliente/999"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        "Endereço não encontrado ou já desativado."
      );
    });

    it("deve retornar 400 em caso de erro na desativação", async () => {
      mockEnderecoClienteService.deleteEndereco.mockRejectedValue(
        new Error("Erro de desativação")
      );

      const response = await request(app as Application).delete(
        "/enderecos_cliente/1"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de desativação");
    });
  });
});
