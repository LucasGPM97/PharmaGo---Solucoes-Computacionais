import ProdutoService from "../../src/services/ProdutoService";
import Produto from "../../src/models/Produto";
import { literal, Op } from "sequelize";

jest.mock("../../src/models/Produto", () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

const mockProdutoData = {
  idproduto: 1,
  nome_comercial: "Tylenol",
  substancia_ativa: "Paracetamol",
  classe_terapeutica: "Analgésico",
  preco_cmed: 10.5,
  toJSON: () => mockProdutoData,
};

describe("ProdutoService - Testes Unitários", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um novo produto com sucesso", async () => {
    (Produto.create as jest.Mock).mockResolvedValue(mockProdutoData as any);

    const data = {
      nome_comercial: "Novo Produto",
      preco_cmed: 15.0,
      requer_receita: false,
      classe_terapeutica: "Antibiótico",
    };

    const result = await ProdutoService.createProduto(data);

    expect(Produto.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockProdutoData);
  });

  it("deve retornar um produto ao buscar por um id existente", async () => {
    (Produto.findByPk as jest.Mock).mockResolvedValue(mockProdutoData as any);
    const result = await ProdutoService.getProdutoById(1);
    expect(Produto.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockProdutoData);
  });

  it("deve retornar uma lista de classes terapêuticas distintas", async () => {
    const mockClasses = [
      { classe_terapeutica: "Analgésico" },
      { classe_terapeutica: "Antigripal" },
    ];
    (Produto.findAll as jest.Mock).mockResolvedValue(mockClasses as any);

    const result = await ProdutoService.getDistinctClassesTerapeuticas();

    expect(Produto.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockClasses);
  });

  it("deve buscar produtos ignorando o case da classe terapêutica", async () => {
    const mockProdutos = [mockProdutoData];
    (Produto.findAll as jest.Mock).mockResolvedValue(mockProdutos as any);

    const classe = "analGÉsico";
    const result = await ProdutoService.getProdutosByClasseTerapeutica(classe);

    expect(Produto.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockProdutos);
  });

  it("deve lançar um erro se a classe terapêutica estiver ausente", async () => {
    await expect(
      ProdutoService.getProdutosByClasseTerapeutica("")
    ).rejects.toThrow("A classe terapêutica é obrigatória para a busca.");
    expect(Produto.findAll).not.toHaveBeenCalled();
  });

  it("deve atualizar um produto e retornar a contagem de linhas afetadas", async () => {
    const updateData = { preco_cmed: 12.0 };
    (Produto.update as jest.Mock).mockResolvedValue([
      1,
      [mockProdutoData],
    ] as any);

    const result = await ProdutoService.updateProduto(1, updateData);

    expect(Produto.update).toHaveBeenCalledWith(updateData, {
      where: { idproduto: 1 },
      returning: true,
    });
    expect(result[0]).toBe(1);
  });

  it("deve deletar um produto e retornar 1 (linha excluída)", async () => {
    (Produto.destroy as jest.Mock).mockResolvedValue(1);

    const deletedRows = await ProdutoService.deleteProduto(1);

    expect(Produto.destroy).toHaveBeenCalledWith({ where: { idproduto: 1 } });
    expect(deletedRows).toBe(1);
  });
});
