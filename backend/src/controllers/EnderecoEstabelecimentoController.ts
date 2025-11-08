import { Request, Response } from "express";
import EnderecoEstabelecimentoService from "../services/EnderecoEstabelecimentoService";

class EnderecoEstabelecimentoController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const endereco = await EnderecoEstabelecimentoService.createEndereco(
        req.body
      );
      return res.status(201).json(endereco);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      // Correção: Utiliza o ID do endereço do estabelecimento da rota
      const endereco = await EnderecoEstabelecimentoService.getEnderecoById(
        Number(req.params.idendereco_estabelecimento)
      );
      if (!endereco) {
        return res
          .status(404)
          .json({ message: "EnderecoEstabelecimento not found" });
      }
      return res.status(200).json(endereco);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  // Renomeado e corrigido para buscar por Estabelecimento
  public async findByEstabelecimento(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      // Correção: Utiliza o ID do estabelecimento da rota
      const enderecos =
        await EnderecoEstabelecimentoService.getAllEnderecosByEstabelecimento(
          Number(req.params.idestabelecimento)
        );
      return res.status(200).json(enderecos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      // Correção: Utiliza o ID do endereço do estabelecimento da rota
      const [affectedCount] =
        await EnderecoEstabelecimentoService.updateEndereco(
          Number(req.params.idendereco_estabelecimento),
          req.body
        );
      if (affectedCount === 0) {
        return res
          .status(404)
          .json({ message: "EnderecoEstabelecimento not found" });
      }
      const updatedEnderecoEstabelecimento =
        await EnderecoEstabelecimentoService.getEnderecoById(
          Number(req.params.idendereco_estabelecimento)
        );
      return res.status(200).json(updatedEnderecoEstabelecimento);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      // Correção: Utiliza o ID do endereço do estabelecimento da rota
      const deletedRows = await EnderecoEstabelecimentoService.deleteEndereco(
        Number(req.params.idendereco_estabelecimento)
      );
      if (deletedRows === 0) {
        return res
          .status(404)
          .json({ message: "EnderecoEstabelecimento not found" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new EnderecoEstabelecimentoController();
