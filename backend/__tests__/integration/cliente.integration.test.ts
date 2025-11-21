import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import Cliente from "../../src/models/Cliente";
import { sequelize } from "../../src/models";

let server: any;
const TEST_PORT = 4001;

// --- Setup e Teardown ---
beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

jest.mock("../../src/services/ClienteService", () => ({
  createCliente: jest.fn(),
  getClienteById: jest.fn(),
  getAllClientes: jest.fn(),
  updateCliente: jest.fn(),
  deleteCliente: jest.fn(),
}));
import ClienteService from "../../src/services/ClienteService";

jest.mock(
  "../../src/middlewares/authMiddleware",
  () => (req: any, res: any, next: any) => {
    req.userId = "mockedUserId";
    next();
  }
);

const mockCliente = {
  idcliente: 100,
  email: "teste.integracao@api.com",
  nome: "Cliente API",
};

describe("ClienteController - Testes de Integração (Rotas)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 201 e criar um cliente", async () => {
    (ClienteService.createCliente as jest.Mock).mockResolvedValue(
      mockCliente as any
    );

    const newClientData = { email: "novo@client.com", nome: "Novo" /* ... */ };

    const response = await request(app as Application)
      .post("/clientes")
      .send(newClientData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockCliente);
    expect(ClienteService.createCliente).toHaveBeenCalledWith(newClientData);
  });

  it("deve retornar 200 e o cliente para um ID existente", async () => {
    (ClienteService.getClienteById as jest.Mock).mockResolvedValue(
      mockCliente as any
    );

    const response = await request(app as Application)
      .get("/clientes/100")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCliente);
    expect(ClienteService.getClienteById).toHaveBeenCalledWith(100);
  });

  it("deve retornar 404 para um ID de cliente inexistente", async () => {
    (ClienteService.getClienteById as jest.Mock).mockResolvedValue(null);

    const response = await request(app as Application)
      .get("/clientes/9999")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Cliente not found" });
    expect(ClienteService.getClienteById).toHaveBeenCalledWith(9999);
  });

  it("deve retornar 200 e o cliente atualizado após um PUT bem-sucedido", async () => {
    const updateData = { nome: "Nome Editado" };
    const updatedCliente = { ...mockCliente, nome: "Nome Editado" };

    (ClienteService.updateCliente as jest.Mock).mockResolvedValue([
      1,
      [updatedCliente],
    ] as any);
    (ClienteService.getClienteById as jest.Mock).mockResolvedValue(
      updatedCliente as any
    );

    const response = await request(app as Application)
      .put("/clientes/100")
      .set("Authorization", "Bearer valid-token")
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.nome).toBe("Nome Editado");
    expect(ClienteService.updateCliente).toHaveBeenCalledWith(100, updateData);
  });
});
