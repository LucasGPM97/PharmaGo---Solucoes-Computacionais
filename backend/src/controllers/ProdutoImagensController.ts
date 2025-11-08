import { Request, Response } from "express";
import ProdutoImagensService from "../services/ProdutoImagensService";

class ProdutoImagensController {
  public async addImage(req: Request, res: Response): Promise<Response> {
    try {
      const { catalogo_produto_idcatalogo_produto, caminho_imagem } = req.body;
      const imagem = await ProdutoImagensService.addImageToCatalogoProduto(
        catalogo_produto_idcatalogo_produto,
        caminho_imagem
      );
      return res.status(201).json(imagem);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async getByProdutoId(req: Request, res: Response): Promise<Response> {
    try {
      const imagens = await ProdutoImagensService.getImagesByCatalogoProdutoId(
        req.params.catalogo_produto_idcatalogo_produto
      );
      return res.status(200).json(imagens);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async removeImage(req: Request, res: Response): Promise<Response> {
    try {
      const deletedRows = await ProdutoImagensService.removeImage(
        Number(req.params.catalogo_produto_idcatalogo_produto)
      );
      if (deletedRows === 0) {
        return res
          .status(404)
          .json({ message: "Imagem de produto não encontrada" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new ProdutoImagensController();
