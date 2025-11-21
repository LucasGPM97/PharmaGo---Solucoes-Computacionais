import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import ProdutoService from "../../src/services/ProdutoService";
import ProdutoController from "../../src/controllers/ProdutoController";

jest.mock("../../src/services/ProdutoService");

jest.mock(
  "../../src/middlewares/authMiddleware",
  () => (req: any, res: any, next: any) => {
    req.userId = "mockedUserId";
    next();
  }
);

const mockProduto = {
  idproduto: 100,
  nome_comercial: "Produto Teste",
  classe_terapeutica: "Analgésico",
  preco_cmed: 15.0,
};

describe("ProdutoController - Testes de Integração (Rotas /produtos)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 201 e criar um novo produto", async () => {
    (ProdutoService.createProduto as jest.Mock).mockResolvedValue(
      mockProduto as any
    );

    const newProductData = {
      nome_comercial: "Novo",
      preco_cmed: 10.0,
    };

    const response = await request(app as Application)
      .post("/produtos")
      .send(newProductData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockProduto);
    expect(ProdutoService.createProduto).toHaveBeenCalledWith(newProductData);
  });

  it("deve retornar 200 e o produto para um ID existente", async () => {
    (ProdutoService.getProdutoById as jest.Mock).mockResolvedValue(
      mockProduto as any
    );

    const response = await request(app as Application)
      .get("/produtos/100")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProduto);
    expect(ProdutoService.getProdutoById).toHaveBeenCalledWith(100);
  });

  it("deve retornar 400 para um ID inválido (não numérico)", async () => {
    const response = await request(app as Application)
      .get("/produtos/abc")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "ID inválido" });
    expect(ProdutoService.getProdutoById).not.toHaveBeenCalled();
  });

  it("deve retornar 200 e a lista de classes terapêuticas", async () => {
    const mockClasses = [{ classe_terapeutica: "Analgésico" }];
    (
      ProdutoService.getDistinctClassesTerapeuticas as jest.Mock
    ).mockResolvedValue(mockClasses as any);

    const response = await request(app as Application)
      .get("/produtos/classes-terapeuticas")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockClasses);
    expect(ProdutoService.getDistinctClassesTerapeuticas).toHaveBeenCalledTimes(
      1
    );
  });

  it("deve retornar 200 e produtos de uma classe específica", async () => {
    const mockProdutos = [mockProduto];
    (
      ProdutoService.getProdutosByClasseTerapeutica as jest.Mock
    ).mockResolvedValue(mockProdutos as any);

    const response = await request(app as Application)
      .get("/produtos/por-classe?classe=Analgésico")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProdutos);
    expect(ProdutoService.getProdutosByClasseTerapeutica).toHaveBeenCalledWith(
      "Analgésico"
    );
  });

  it("deve retornar 200 e o produto atualizado após um PUT bem-sucedido", async () => {
    const updateData = { preco_cmed: 18.0 };
    const updatedProduto = { ...mockProduto, preco_cmed: 18.0 };

    (ProdutoService.updateProduto as jest.Mock).mockResolvedValue([
      1,
      [updatedProduto],
    ] as any);
    (ProdutoService.getProdutoById as jest.Mock).mockResolvedValue(
      updatedProduto as any
    );

    const response = await request(app as Application)
      .put("/produtos/100")
      .set("Authorization", "Bearer valid-token")
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.preco_cmed).toBe(18.0);
    expect(ProdutoService.updateProduto).toHaveBeenCalledWith(100, updateData);
  });

  it("deve retornar 204 após um DELETE bem-sucedido", async () => {
    (ProdutoService.deleteProduto as jest.Mock).mockResolvedValue(1);

    const response = await request(app as Application)
      .delete("/produtos/100")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(204);
    expect(ProdutoService.deleteProduto).toHaveBeenCalledWith(100);
  });
});
