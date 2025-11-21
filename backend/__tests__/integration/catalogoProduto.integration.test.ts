import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import CatalogoProdutoService from "../../src/services/CatalogoProdutoService";

jest.mock("../../src/models/Catalogo", () => ({
  default: {},
}));

jest.mock("../../src/models/Produto", () => ({
  default: {},
}));

jest.mock("../../src/models/CatalogoProduto");

jest.mock("../../src/services/CatalogoProdutoService");

jest.mock(
  "../../src/middlewares/authMiddleware",
  () => (req: any, res: any, next: any) => {
    req.userId = "mockedUserId";
    next();
  }
);

const mockCatalogoProduto = {
  idcatalogo_produto: 50,
  catalogo_idcatalogo: 10,
  produto_idproduto: 100,
  valor_venda: 25.9,
};

describe("CatalogoProdutoController - Testes de Integração (Rotas /catalogo-produtos)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 201 e adicionar um produto ao catálogo", async () => {
    (CatalogoProdutoService.addProdutoToCatalog as jest.Mock).mockResolvedValue(
      mockCatalogoProduto as any
    );

    const newCatalogItemData = {
      catalogo_idcatalogo: 10,
      produto_idproduto: 100,
      valor_venda: 25.9,
    };

    const response = await request(app as Application)
      .post("/catalogo-produtos")
      .set("Authorization", "Bearer valid-token")
      .send(newCatalogItemData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockCatalogoProduto);
    expect(CatalogoProdutoService.addProdutoToCatalog).toHaveBeenCalledWith(
      newCatalogItemData
    );
  });

  it("deve retornar 200 e o item de catálogo para um ID existente", async () => {
    (
      CatalogoProdutoService.getCatalogoProdutoById as jest.Mock
    ).mockResolvedValue(mockCatalogoProduto as any);

    const response = await request(app as Application)
      .get("/catalogo-produtos/50")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCatalogoProduto);
    expect(CatalogoProdutoService.getCatalogoProdutoById).toHaveBeenCalledWith(
      50
    );
  });

  it("deve retornar 200 e lista de produtos para um ID de estabelecimento", async () => {
    const mockList = [mockCatalogoProduto];
    (
      CatalogoProdutoService.getProdutosByCatalogo as jest.Mock
    ).mockResolvedValue(mockList as any);

    const response = await request(app as Application)
      .get("/catalogo-produtos/estabelecimento/10")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockList);
    expect(CatalogoProdutoService.getProdutosByCatalogo).toHaveBeenCalledWith(
      10
    );
  });

  it("deve retornar 204 após um DELETE bem-sucedido", async () => {
    (
      CatalogoProdutoService.removeProdutoFromCatalogo as jest.Mock
    ).mockResolvedValue(1);

    const response = await request(app as Application)
      .delete("/catalogo-produtos/50")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(204);
    expect(
      CatalogoProdutoService.removeProdutoFromCatalogo
    ).toHaveBeenCalledWith(50);
  });
});
