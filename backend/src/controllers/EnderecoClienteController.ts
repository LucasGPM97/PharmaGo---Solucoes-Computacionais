import { Request, Response } from "express";
import EnderecoClienteService from "../services/EnderecoClienteService";

class EnderecoClienteController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const endereco = await EnderecoClienteService.createEndereco(req.body);
      return res.status(201).json(endereco);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const endereco = await EnderecoClienteService.getEnderecoById(id);
      if (!endereco) {
        return res.status(404).json({ message: "EnderecoCliente not found" });
      }
      return res.status(200).json(endereco);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findByCliente(req: Request, res: Response): Promise<Response> {
    try {
      console.log("📍 Controller - Parâmetro recebido:", req.params.idcliente);

      const idcliente = Number(req.params.idcliente);
      console.log("📍 Controller - ID convertido:", idcliente);

      if (isNaN(idcliente)) {
        return res.status(400).json({ message: "ID do cliente inválido" });
      }

      const enderecos = await EnderecoClienteService.getAllEnderecosByCliente(
        idcliente
      );
      return res.status(200).json(enderecos);
    } catch (error: any) {
      console.error("❌ Controller - Erro:", error.message);
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const [affectedCount] = await EnderecoClienteService.updateEndereco(
        id,
        req.body
      );
      if (affectedCount === 0) {
        return res.status(404).json({ message: "EnderecoCliente not found" });
      }

      const updatedEnderecoCliente =
        await EnderecoClienteService.getEnderecoById(id);
      return res.status(200).json(updatedEnderecoCliente);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      const affectedRows = await EnderecoClienteService.deleteEndereco(id);
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Endereço não encontrado ou já desativado." });
      }
      return res
        .status(200)
        .json({ message: "Endereço desativado com sucesso." });
    } catch (error: any) {
      console.error(
        "❌ Controller - Erro ao desativar endereço:",
        error.message
      );
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new EnderecoClienteController();
