import { Request, Response } from "express";
import CatalogoProdutoService from "../services/CatalogoProdutoService";

class CatalogoProdutoController {
  public async addProdutoToCatalog(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const catalogoProduto = await CatalogoProdutoService.addProdutoToCatalog(
        req.body
      );
      return res.status(201).json(catalogoProduto);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const catalogoProduto =
        await CatalogoProdutoService.getCatalogoProdutoById(
          Number(req.params.idcatalogo_produto)
        );
      if (!catalogoProduto) {
        return res
          .status(404)
          .json({ message: "Produto no catálogo não encontrado" });
      }
      return res.status(200).json(catalogoProduto);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async getByEstabelecimento(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const idEstabelecimento = Number(req.params.idestabelecimento);

      const catalogoProdutos =
        await CatalogoProdutoService.getProdutosByCatalogo(
          Number(req.params.idestabelecimento)
        );
      console.log("-----------------------------------------");
      console.log(
        `Dados retornados do Service para idEstabelecimento ${idEstabelecimento}:`
      );
      console.log(JSON.stringify(catalogoProdutos, null, 2)); 
      console.log("-----------------------------------------");
      return res.status(200).json(catalogoProdutos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const idcatalogo_produto_param = Number(req.params.idcatalogo_produto);

      const data = req.body;

      const [affectedCount] =
        await CatalogoProdutoService.updateCatalogoProduto(
          idcatalogo_produto_param,
          data
        );

      if (affectedCount === 0) {
        return res
          .status(404)
          .json({
            message:
              "Produto no catálogo não encontrado ou nenhum dado para atualizar.",
          });
      }

      const updatedCatalogoProduto =
        await CatalogoProdutoService.getCatalogoProdutoById(
          idcatalogo_produto_param
        );

      return res.status(200).json(updatedCatalogoProduto);
    } catch (error: any) {
      return res
        .status(400)
        .json({
          message: error.message || "Erro ao atualizar produto no catálogo.",
        });
    }
  }

  public async remove(req: Request, res: Response): Promise<Response> {
    try {
      const deletedRows =
        await CatalogoProdutoService.removeProdutoFromCatalogo(
          Number(req.params.idcatalogo_produto)
        );
      if (deletedRows === 0) {
        return res
          .status(404)
          .json({ message: "Produto no catálogo não encontrado" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new CatalogoProdutoController();
