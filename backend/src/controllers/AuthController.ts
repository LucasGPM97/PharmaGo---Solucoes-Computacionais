import { Request, Response } from "express";
import AuthService from "../services/AuthService";
import CarrinhoService from "../services/CarrinhoService";
import CatalogoService from "../services/CatalogoService";
import HorarioFuncionamentoService from "../services/HorarioFuncionamentoService";
import EstabelecimentoService from "../services/EstabelecimentoService";

class AuthController {
  public async registerCliente(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Dados recebidos no backend:", req.body);
      const cliente = await AuthService.registerCliente(req.body);
      await CarrinhoService.getOrCreateCarrinho(cliente.idcliente);
      return res.status(201).json({
        message: "Cliente registrado com sucesso",
        cliente: {
          id: cliente.idcliente,
          email: cliente.email,
          nome: cliente.nome,
        },
      });
    } catch (error: any) {
      console.error("Erro ao registrar cliente:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  public async loginCliente(req: Request, res: Response): Promise<Response> {
    try {
      const { email, senha } = req.body;
      const result = await AuthService.loginCliente(email, senha);

      if (!result) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      return res.status(200).json({
        token: result.token,
        cliente: result.cliente,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async registerEstabelecimento(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      console.log("Dados recebidos no backend:", req.body);
      const estabelecimento = await AuthService.registerEstabelecimento(
        req.body
      );
      return res.status(201).json({
        message: "Estabelecimento registrado com sucesso",
        estabelecimento: {
          id: estabelecimento.idestabelecimento,
          email: estabelecimento.email,
          razao_social: estabelecimento.razao_social,
        },
      });
    } catch (error: any) {
      console.error("Erro ao registrar estabelecimento:", error);
      return res.status(400).json({ message: error.message });
    }
  }

  public async loginEstabelecimento(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { email, senha } = req.body;
      const result = await AuthService.loginEstabelecimento(email, senha);

      if (!result) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      return res.status(200).json({
        token: result.token,
        estabelecimento: result.estabelecimento,
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new AuthController();
