import ImagemProduto from "../models/ImagemProduto";

class ImagemProdutoService {
  public async addImageToCatalogoProduto(
    catalogo_produto_idcatalogo_produto: number,
    caminho_imagem: string
  ): Promise<ImagemProduto> {
    const imagem = await ImagemProduto.create({
      catalogo_produto_idcatalogo_produto,
      caminho_imagem,
    });
    return imagem;
  }

  public async getImagesByCatalogoProdutoId(
    catalogo_produto_idcatalogo_produto: string
  ): Promise<ImagemProduto[]> {
    const imagens = await ImagemProduto.findAll({
      where: { catalogo_produto_idcatalogo_produto },
    });
    return imagens;
  }

  public async removeImage(idimagem_produto: number): Promise<number> {
    const deletedRows = await ImagemProduto.destroy({
      where: { idimagem_produto },
    });
    return deletedRows;
  }
}

export default new ImagemProdutoService();
