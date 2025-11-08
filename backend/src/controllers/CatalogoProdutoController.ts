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
          // ❌ ERA: Number(req.params.catalogo_idcatalogo)
          // ✅ CORRIGIDO: Usa o nome correto do parâmetro da rota
          Number(req.params.idestabelecimento)
        );
      // 🎯 LOG MAIS IMPORTANTE: Mostra o que o Sequelize retornou
      console.log("-----------------------------------------");
      console.log(
        `Dados retornados do Service para idEstabelecimento ${idEstabelecimento}:`
      );
      console.log(JSON.stringify(catalogoProdutos, null, 2)); // Use JSON.stringify(..., null, 2) para formatação legível
      console.log("-----------------------------------------");
      return res.status(200).json(catalogoProdutos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      // ✅ CORREÇÃO 1: Usar o parâmetro correto da rota
      const idcatalogo_produto_param = Number(req.params.idcatalogo_produto);

      // O corpo (body) contém { valor_venda, disponibilidade }
      const data = req.body;

      const [affectedCount] =
        await CatalogoProdutoService.updateCatalogoProduto(
          // ✅ CORREÇÃO 2: Passar o ID da rota
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

      // Buscamos o produto atualizado.
      // O frontend espera o objeto completo de volta (embora a busca seja opcional se o Service retornar o objeto)
      const updatedCatalogoProduto =
        await CatalogoProdutoService.getCatalogoProdutoById(
          idcatalogo_produto_param
        );

      // 🚀 O service frontend espera a resposta do item atualizado.
      // Se a sua API retorna o objeto completo do CatalogoProduto, isso funciona.
      return res.status(200).json(updatedCatalogoProduto);
    } catch (error: any) {
      // Captura erros de validação ou de banco de dados
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
