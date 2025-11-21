import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import AuthService from "../../src/services/AuthService";
import CarrinhoService from "../../src/services/CarrinhoService";

jest.mock("../../src/services/AuthService");
jest.mock("../../src/services/CarrinhoService");

const mockAuthResponse = {
  token: "fake.jwt.token",
  cliente: { idcliente: 1, email: "auth@test.com", nome: "Auth Client" },
};

describe("AuthController - Testes de Integração (Auth Routes)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 201 e registrar um novo cliente", async () => {
    const newClientData = {
      email: "new@reg.com",
      senha: "pw",
      nome: "New Reg" /* ... */,
    };
    (AuthService.registerCliente as jest.Mock).mockResolvedValue(
      mockAuthResponse.cliente as any
    );
    (CarrinhoService.getOrCreateCarrinho as jest.Mock).mockResolvedValue({});

    const response = await request(app as Application)
      .post("/auth/registerCliente")
      .send(newClientData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Cliente registrado com sucesso");
    expect(AuthService.registerCliente).toHaveBeenCalledWith(newClientData);
    expect(CarrinhoService.getOrCreateCarrinho).toHaveBeenCalledWith(1);
  });

  it("deve retornar 400 em caso de falha de registro (ex: email duplicado)", async () => {
    const newClientData = {
      email: "duplicado@reg.com",
      senha: "pw",
      nome: "Duplicate",
    };
    (AuthService.registerCliente as jest.Mock).mockRejectedValue(
      new Error("Email already exists") as any
    );

    const response = await request(app as Application)
      .post("/auth/registerCliente")
      .send(newClientData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email already exists");
  });

  it("deve retornar 200 e o token/dados do cliente em login válido", async () => {
    (AuthService.loginCliente as jest.Mock).mockResolvedValue(mockAuthResponse);

    const response = await request(app as Application)
      .post("/auth/loginCliente")
      .send({ email: "valid@user.com", senha: "correctpassword" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe("fake.jwt.token");
    expect(response.body.cliente.idcliente).toBe(1);
  });
});
