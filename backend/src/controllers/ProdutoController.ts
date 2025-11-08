import { Request, Response } from "express";
import ProdutoService from "../services/ProdutoService";
import sequelize from "sequelize";
import Produto from "../models/Produto";

class ProdutoController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const produto = await ProdutoService.createProduto(req.body);
      return res.status(201).json(produto);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const idproduto = req.params.idproduto;
      console.log("ID recebido:", Number(idproduto));

      if (isNaN(Number(idproduto))) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const produto = await ProdutoService.getProdutoById(Number(idproduto));
      if (!produto) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      return res.status(200).json(produto);
    } catch (error: any) {
      console.error("Erro ao buscar produto:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const produtos = await ProdutoService.getAllProdutos();
      return res.status(200).json(produtos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const [affectedCount] = await ProdutoService.updateProduto(
        Number(req.params.idproduto),
        req.body
      );
      if (affectedCount === 0) {
        return res.status(404).json({ message: "Produto not found" });
      }
      const updatedProduto = await ProdutoService.getProdutoById(
        Number(req.params.idproduto)
      );
      return res.status(200).json(updatedProduto);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const deletedRows = await ProdutoService.deleteProduto(
        Number(req.params.idproduto)
      );
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Produto not found" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findDistinctClasses(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const distinctClasses =
        await ProdutoService.getDistinctClassesTerapeuticas();
      if (distinctClasses.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma classe terapêutica encontrada." });
      }
      return res.status(200).json(distinctClasses);
    } catch (error: any) {
      console.error("Erro ao buscar classes terapêuticas:", error);
      return res
        .status(500)
        .json({ message: "Erro interno do servidor", error: error.message });
    }
  }


  public async findByClasse(req: Request, res: Response): Promise<Response> {
    try {
      const { classe } = req.query;

      if (typeof classe !== "string" || !classe) {
        return res
          .status(400)
          .json({ message: "Parâmetro 'classe' inválido ou ausente." });
      }

      const produtos = await ProdutoService.getProdutosByClasseTerapeutica(
        classe
      );

      if (produtos.length === 0) {
        return res
          .status(404)
          .json({
            message: `Nenhum produto encontrado para a classe: ${classe}`,
          });
      }

      return res.status(200).json(produtos);
    } catch (error: any) {
      console.error("Erro ao buscar produtos por classe:", error);
      return res
        .status(500)
        .json({
          message: "Erro interno ao buscar produtos.",
          error: error.message,
        });
    }
  }
}

export default new ProdutoController();
