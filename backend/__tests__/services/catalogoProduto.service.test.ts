import CatalogoProdutoService from "../../src/services/CatalogoProdutoService";
import CatalogoProduto from "../../src/models/CatalogoProduto";
import Produto from "../../src/models/Produto";
import Catalogo from "../../src/models/Catalogo";

jest.mock("../../src/models/CatalogoProduto", () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../../src/models/Produto", () => ({}));
jest.mock("../../src/models/Catalogo", () => ({}));

const mockCatalogoProduto = {
  idcatalogo_produto: 1,
  catalogo_idcatalogo: 1,
  produto_idproduto: 1,
  disponibilidade: true,
  valor_venda: 29.99,
  produto: {
    idproduto: 1,
    nome: "Produto Teste",
    descricao: "Descrição do produto teste",
  },
  catalogo: {
    idcatalogo: 1,
    nome: "Catálogo Teste",
  },
  toJSON: () => mockCatalogoProduto,
};

describe("CatalogoProdutoService - Testes Unitários", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve adicionar um produto ao catálogo com sucesso", async () => {
    (CatalogoProduto.create as jest.Mock).mockResolvedValue(
      mockCatalogoProduto as any
    );

    const data = {
      catalogo_idcatalogo: 1,
      produto_idproduto: 1,
      valor_venda: 29.99,
      disponibilidade: true,
    };

    const result = await CatalogoProdutoService.addProdutoToCatalog(data);

    expect(CatalogoProduto.create).toHaveBeenCalledTimes(1);
    expect(CatalogoProduto.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(mockCatalogoProduto);
  });

  it("deve retornar um produto do catálogo ao buscar por id existente", async () => {
    (CatalogoProduto.findByPk as jest.Mock).mockResolvedValue(
      mockCatalogoProduto as any
    );

    const result = await CatalogoProdutoService.getCatalogoProdutoById(1);

    expect(CatalogoProduto.findByPk).toHaveBeenCalledWith(1, {
      include: [
        { model: Produto, as: "produto" },
        { model: Catalogo, as: "catalogo" },
      ],
    });
    expect(result).toEqual(mockCatalogoProduto);
  });

  it("deve retornar null ao buscar por id inexistente", async () => {
    (CatalogoProduto.findByPk as jest.Mock).mockResolvedValue(null);

    const result = await CatalogoProdutoService.getCatalogoProdutoById(999);

    expect(CatalogoProduto.findByPk).toHaveBeenCalledWith(999, {
      include: [
        { model: Produto, as: "produto" },
        { model: Catalogo, as: "catalogo" },
      ],
    });
    expect(result).toBeNull();
  });

  it("deve retornar uma lista de produtos ao buscar por catálogo", async () => {
    const mockCatalogoProdutosList = [
      mockCatalogoProduto,
      {
        ...mockCatalogoProduto,
        idcatalogo_produto: 2,
        produto_idproduto: 2,
        produto: {
          idproduto: 2,
          nome: "Outro Produto",
          descricao: "Descrição do outro produto",
        },
      },
    ];

    (CatalogoProduto.findAll as jest.Mock).mockResolvedValue(
      mockCatalogoProdutosList as any
    );

    const result = await CatalogoProdutoService.getProdutosByCatalogo(1);

    expect(CatalogoProduto.findAll).toHaveBeenCalledWith({
      where: { catalogo_idcatalogo: 1 },
      include: [{ model: Produto, as: "produto" }],
    });
    expect(result).toHaveLength(2);
    expect(result).toEqual(mockCatalogoProdutosList);
  });

  it("deve atualizar um produto do catálogo e retornar a contagem de linhas afetadas", async () => {
    const updateData = { valor_venda: 39.99, disponibilidade: false };
    (CatalogoProduto.update as jest.Mock).mockResolvedValue([
      1,
      [mockCatalogoProduto],
    ] as any);

    const result = await CatalogoProdutoService.updateCatalogoProduto(
      1,
      updateData
    );

    expect(CatalogoProduto.update).toHaveBeenCalledWith(updateData, {
      where: { idcatalogo_produto: 1 },
      returning: true,
    });
    expect(result[0]).toBe(1);
    expect(result[1]).toEqual([mockCatalogoProduto]);
  });

  it("deve retornar 0 ao tentar atualizar produto do catálogo inexistente", async () => {
    const updateData = { valor_venda: 39.99 };
    (CatalogoProduto.update as jest.Mock).mockResolvedValue([0, []] as any);

    const result = await CatalogoProdutoService.updateCatalogoProduto(
      999,
      updateData
    );

    expect(result[0]).toBe(0);
    expect(result[1]).toEqual([]);
  });

  it("deve remover um produto do catálogo e retornar 1 (linha excluída)", async () => {
    (CatalogoProduto.destroy as jest.Mock).mockResolvedValue(1);

    const deletedRows = await CatalogoProdutoService.removeProdutoFromCatalogo(
      1
    );

    expect(CatalogoProduto.destroy).toHaveBeenCalledWith({
      where: { idcatalogo_produto: 1 },
    });
    expect(deletedRows).toBe(1);
  });

  it("deve retornar 0 ao tentar remover produto do catálogo inexistente", async () => {
    (CatalogoProduto.destroy as jest.Mock).mockResolvedValue(0);

    const deletedRows = await CatalogoProdutoService.removeProdutoFromCatalogo(
      999
    );

    expect(deletedRows).toBe(0);
  });

  it("deve retornar array vazio ao buscar produtos de catálogo sem produtos", async () => {
    (CatalogoProduto.findAll as jest.Mock).mockResolvedValue([]);

    const result = await CatalogoProdutoService.getProdutosByCatalogo(2);

    expect(CatalogoProduto.findAll).toHaveBeenCalledWith({
      where: { catalogo_idcatalogo: 2 },
      include: [{ model: Produto, as: "produto" }],
    });
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
