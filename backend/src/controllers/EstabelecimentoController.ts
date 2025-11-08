import { Request, Response } from "express";
import EstabelecimentoService from "../services/EstabelecimentoService";

class EstabelecimentoController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const estabelecimento =
        await EstabelecimentoService.createEstabelecimento(req.body);
      return res.status(201).json(estabelecimento);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.idestabelecimento);

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ message: "ID do estabelecimento inválido" });
    }

    try {
      const estabelecimento =
        await EstabelecimentoService.getEstabelecimentoById(id);

      if (!estabelecimento) {
        return res
          .status(404)
          .json({ message: "Estabelecimento não encontrado" });
      }

      return res.status(200).json(estabelecimento);
    } catch (error: any) {
      console.error("Erro no findById:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const estabelecimentos =
        await EstabelecimentoService.getAllEstabelecimentos();
      return res.status(200).json(estabelecimentos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const [affectedCount] =
        await EstabelecimentoService.updateEstabelecimento(
          Number(req.params.idestabelecimento),
          req.body
        );
      if (affectedCount === 0) {
        return res.status(404).json({ message: "Estabelecimento not found" });
      }
      const updatedEstabelecimento =
        await EstabelecimentoService.getEstabelecimentoById(
          Number(req.params.idestabelecimento)
        );
      return res.status(200).json(updatedEstabelecimento);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const deletedRows = await EstabelecimentoService.deleteEstabelecimento(
        Number(req.params.idestabelecimento)
      );
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Estabelecimento not found" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new EstabelecimentoController();
