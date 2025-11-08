import CatalogoProduto from "../models/CatalogoProduto";
import Produto from "../models/Produto";
import Catalogo from "../models/Catalogo";

class CatalogoProdutoService {
  public async addProdutoToCatalog(data: any): Promise<CatalogoProduto> {
    const {
      catalogo_idcatalogo,
      produto_idproduto,
      valor_venda,
      disponibilidade,
    } = data;
    const catalogoProduto = await CatalogoProduto.create({
      catalogo_idcatalogo,
      produto_idproduto,
      valor_venda,
      disponibilidade,
    });
    return catalogoProduto;
  }

  public async getCatalogoProdutoById(
    idcatalogo_produto: number
  ): Promise<CatalogoProduto | null> {
    const catalogoProduto = await CatalogoProduto.findByPk(idcatalogo_produto, {
      include: [
        { model: Produto, as: "produto" },
        { model: Catalogo, as: "catalogo" },
      ],
    });
    return catalogoProduto;
  }

  public async getProdutosByCatalogo(
    catalogoId: number
  ): Promise<CatalogoProduto[]> {
    const catalogoProdutos = await CatalogoProduto.findAll({
      where: { catalogo_idcatalogo: catalogoId },
      include: [{ model: Produto, as: "produto" }],
    });
    return catalogoProdutos;
  }

  public async updateCatalogoProduto(
    idcatalogo_produto: number,
    data: any
  ): Promise<[number, CatalogoProduto[]]> {
    const [affectedCount, affectedRows] = await CatalogoProduto.update(data, {
      where: { idcatalogo_produto },
      returning: true,
    });
    return [affectedCount, affectedRows];
  }

  public async removeProdutoFromCatalogo(
    idcatalogo_produto: number
  ): Promise<number> {
    const deletedRows = await CatalogoProduto.destroy({
      where: { idcatalogo_produto },
    });
    return deletedRows;
  }
}

export default new CatalogoProdutoService();
