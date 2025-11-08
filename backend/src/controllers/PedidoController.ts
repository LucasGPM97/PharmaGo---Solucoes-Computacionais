import { Request, Response } from "express";
import PedidoService from "../services/PedidoService";

class PedidoController {
  public async create(req: Request, res: Response): Promise<Response> {
    // Dados que vêm do Frontend (OrderSummary)
    const {
      idcarrinho,
      cliente_idcliente,
      endereco_cliente_idendereco_cliente,
      forma_pagamento_idforma_pagamento,
      observacoes,
    } = req.body;

    const clienteId = (req as any).user?.id || cliente_idcliente;

    console.log("--- DEBUG CHECKOUT INÍCIO ---");
    console.log("Payload Recebido:", req.body);
    console.log(`Cliente ID (do Token/Body): ${clienteId}`);
    console.log(`Carrinho ID: ${idcarrinho}`);
    console.log(`Endereço ID: ${endereco_cliente_idendereco_cliente}`);
    console.log(`Pagamento ID: ${forma_pagamento_idforma_pagamento}`);
    console.log("----------------------------");
    try {
      if (
        !clienteId ||
        !idcarrinho ||
        !endereco_cliente_idendereco_cliente ||
        !forma_pagamento_idforma_pagamento
      ) {
        // 🚨 LOG 2: Qual campo faltou na validação?
        console.error("❌ ERRO 400: Dados de checkout incompletos.");
        console.log(
          `Faltando Cliente: ${!clienteId}, Carrinho: ${!idcarrinho}, Endereço: ${!endereco_cliente_idendereco_cliente}, Pagamento: ${!forma_pagamento_idforma_pagamento}`
        );
        // A mensagem de erro será lançada aqui se os campos estiverem faltando no body
        return res
          .status(400)
          .json({
            message:
              "Dados de checkout incompletos (cliente, carrinho, endereço ou pagamento).",
          });
      }

      const dadosAdicionais = {
        // 🎯 CORRIGIDO: Passar o valor diretamente
        endereco_cliente_idendereco_cliente:
          endereco_cliente_idendereco_cliente,
        forma_pagamento_idforma_pagamento: forma_pagamento_idforma_pagamento,
        observacoes,
      };

      // 🚨 Chama a lógica principal de checkout com transação
      const pedido = await PedidoService.criarPedidoDoCarrinho(
        clienteId,
        idcarrinho, // Não precisa corrigir, já está certo
        dadosAdicionais
      );

      // Retorna o ID do pedido criado
      return res.status(201).json({
        idpedido: pedido.idpedido,
        message: "Pedido criado e carrinho limpo com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro no checkout:", error.message);
      // Retorna 400 se o erro for de validação (ex: carrinho vazio, item indisponível)
      return res.status(400).json({ message: error.message });
    }
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { idpedido } = req.params;

      if (!idpedido || isNaN(Number(idpedido))) {
        return res.status(400).json({
          message: "ID do pedido inválido ou não fornecido",
        });
      }

      const pedidoId = Number(idpedido);
      console.log(`[DEBUG] Buscando pedido com ID: ${pedidoId}`);

      const pedido = await PedidoService.getPedidoById(pedidoId);

      if (!pedido) {
        console.log(`[DEBUG] Pedido ${pedidoId} não encontrado`);
        return res.status(404).json({
          message: "Pedido não encontrado",
        });
      }

      console.log(`[DEBUG] Pedido ${pedidoId} encontrado com sucesso`);
      return res.status(200).json(pedido);
    } catch (error: any) {
      console.error(`[ERROR] Erro ao buscar pedido:`, error);
      return res.status(400).json({
        message: error.message || "Erro interno do servidor",
      });
    }
  }

  public async findByCliente(req: Request, res: Response): Promise<Response> {
    try {
      // --- LOG DE DEBUG NO CONTROLLER ---
      const paramName = "cliente_idcliente"; // Assumindo que você corrigiu a rota
      const clienteIdParam = req.params[paramName];
      const clienteIdNumber = Number(clienteIdParam);

      console.log(`[DEBUG PedidoController] Rota: /cliente/${paramName}`);
      console.log(
        `[DEBUG PedidoController] Valor do Parâmetro na URL (${paramName}): ${clienteIdParam}`
      );
      console.log(
        `[DEBUG PedidoController] Valor Convertido para Number: ${clienteIdNumber}`
      );
      // --- FIM LOG DE DEBUG ---
      const pedidos = await PedidoService.getAllPedidosByCliente(
        Number(req.params.cliente_idcliente)
      );
      return res.status(200).json(pedidos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async findByEstabelecimento(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const pedidos = await PedidoService.getAllPedidosByEstabelecimento(
        Number(req.params.estabelecimento_idestabelecimento)
      );
      return res.status(200).json(pedidos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const [affectedCount] = await PedidoService.updatePedido(
        Number(req.params.idpedido),
        req.body
      );
      if (affectedCount === 0) {
        return res.status(404).json({ message: "Pedido not found" });
      }
      const updatedPedido = await PedidoService.getPedidoById(
        Number(req.params.idpedido)
      );
      return res.status(200).json(updatedPedido);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const deletedRows = await PedidoService.deletePedido(
        Number(req.params.idpedido)
      );
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Pedido not found" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new PedidoController();
