import { Request, Response } from "express";
import ClienteService from "../services/ClienteService";
import CarrinhoService from "../services/CarrinhoService";

class ClienteController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const cliente = await ClienteService.createCliente(req.body);
      return res.status(201).json(cliente);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const cliente = await ClienteService.getClienteById(
        Number(req.params.idcliente)
      );
      if (!cliente) {
        return res.status(404).json({ message: "Cliente not found" });
      }
      return res.status(200).json(cliente);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const clientes = await ClienteService.getAllClientes();
      return res.status(200).json(clientes);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const [affectedCount] = await ClienteService.updateCliente(
        Number(req.params.idcliente),
        req.body
      );
      if (affectedCount === 0) {
        return res.status(404).json({ message: "Cliente not found" });
      }
      const updatedCliente = await ClienteService.getClienteById(
        Number(req.params.idcliente)
      );
      return res.status(200).json(updatedCliente);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const deletedRows = await ClienteService.deleteCliente(
        Number(req.params.idcliente)
      );
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Cliente not found" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new ClienteController();
