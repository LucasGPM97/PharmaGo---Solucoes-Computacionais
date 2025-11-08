import { Request, Response } from "express";
import CarrinhoService from "../services/CarrinhoService";

class CarrinhoController {
  public async getCarrinho(req: Request, res: Response): Promise<Response> {
    try {
      const { idcliente } = req.params;
      await CarrinhoService.getOrCreateCarrinho(Number(idcliente));
      const carrinhoComItens = await CarrinhoService.getCarrinhoCompleto(
        Number(idcliente)
      );
      if (!carrinhoComItens) {
        return res
          .status(404)
          .json({ message: "Carrinho não encontrado após criação." });
      }

      return res.status(200).json(carrinhoComItens);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async addItem(req: Request, res: Response): Promise<Response> {
    try {
      const { idcarrinho } = req.params;
      const { idcatalogo_produto, quantidade } = req.body;

      if (!idcatalogo_produto || !quantidade) {
        return res.status(400).json({
          message:
            "Dados do item (idcatalogo_produto e quantidade) são obrigatórios.",
        });
      }

      const item = await CarrinhoService.addItemToCarrinho(
        Number(idcarrinho),
        Number(idcatalogo_produto),
        Number(quantidade)
      );
      return res.status(201).json(item);
    } catch (error: any) {
      console.error("Erro no Controller addItem:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  public async removeItem(req: Request, res: Response): Promise<Response> {
    try {
      const { idcarrinho, idproduto } = req.params;
      const deletedRows = await CarrinhoService.removeItemFromCarrinho(
        Number(idcarrinho),
        Number(idproduto)
      );
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Item not found in carrinho" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async updateItemQuantity(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { idcarrinho, idproduto } = req.params;
      const { quantidade } = req.body;
      const [affectedCount] = await CarrinhoService.updateCarrinhoItemQuantity(
        Number(idcarrinho),
        Number(idproduto),
        quantidade
      );
      if (affectedCount === 0) {
        return res
          .status(404)
          .json({ message: "Item não encontrado no carrinho" });
      }

      const carrinho = await CarrinhoService.getCarrinhoComItens(
        Number(req.params.idcarrinho)
      );
      return res.status(200).json(carrinho);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async clearCarrinho(req: Request, res: Response): Promise<Response> {
    try {
      const { idcarrinho } = req.params;
      await CarrinhoService.clearCarrinho(Number(idcarrinho));
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new CarrinhoController();
