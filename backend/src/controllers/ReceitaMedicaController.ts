import { Request, Response } from "express";
import ReceitaMedicaService from "../services/ReceitaMedicaService";

class ReceitaMedicaController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const receitaMedica = await ReceitaMedicaService.createReceitaMedica(
        req.body
      );
      return res.status(201).json(receitaMedica);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const receitaMedica = await ReceitaMedicaService.getReceitaMedicaById(
        req.params.idreceita_medica
      );
      if (!receitaMedica) {
        return res.status(404).json({ message: "Receita Médica not found" });
      }
      return res.status(200).json(receitaMedica);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findByPedidoId(req: Request, res: Response): Promise<Response> {
    try {
      const receitaMedica =
        await ReceitaMedicaService.getReceitaMedicaByPedidoId(
          Number(req.params.pedido_idpedido)
        );
      if (!receitaMedica) {
        return res
          .status(404)
          .json({ message: "Receita Médica not found for this Pedido" });
      }
      return res.status(200).json(receitaMedica);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const [affectedCount] = await ReceitaMedicaService.updateReceitaMedica(
        Number(req.params.idreceita_medica),
        req.body
      );
      if (affectedCount === 0) {
        return res.status(404).json({ message: "Receita Médica not found" });
      }
      const updatedReceitaMedica =
        await ReceitaMedicaService.getReceitaMedicaById(
          req.params.idreceita_medica
        );
      return res.status(200).json(updatedReceitaMedica);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const deletedRows = await ReceitaMedicaService.deleteReceitaMedica(
        Number(req.params.idreceita_medica)
      );
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Receita Médica not found" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new ReceitaMedicaController();
