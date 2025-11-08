import { Request, Response } from "express";
import FormaPagamentoService from "../services/FormaPagamentoService";

class FormaPagamentoController {
  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const formasPagamento =
        await FormaPagamentoService.getAllFormasPagamento();
      return res.status(200).json(formasPagamento);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const idFormaPagamento = Number(req.params.id);

      const formaPagamento = await FormaPagamentoService.getFormaPagamentoById(
        idFormaPagamento
      );
      if (!formaPagamento) {
        return res
          .status(404)
          .json({ message: "Forma de Pagamento not found" });
      }
      return res.status(200).json(formaPagamento);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new FormaPagamentoController();
