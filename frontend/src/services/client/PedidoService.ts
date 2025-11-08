// src/services/client/PedidoService.ts

import api from "../../api/api";
import { getAuthToken, getClientId } from "../common/AuthService";

// --- Tipagens ---
type FormaPagamentoString = "local" | "card" | "wallet" | "pix";

export interface CreateOrderData {
  idcarrinho: number; // ID do carrinho a ser finalizado
  endereco_cliente_idendereco_cliente: string | number;
  forma_pagamento_string: FormaPagamentoString;
  forma_pagamento_idforma_pagamento: number;
  observacoes?: string;
}

export interface PedidoCriadoResponse {
  idpedido: number;
  message: string;
}

export interface Order {
  id: string | number; // Corresponde a idpedido
  totalAmount: number; // Corresponde a valor_total
  status: string; // Corresponde a status
  createdAt: string; // Corresponde a data_pedido ou created_at
  // Se precisar de mais detalhes, adicione aqui (ex: establishmentName)
}

export interface OrderDetail {
  idpedido: number;
  valor_total: number;
  status: string;
  data_pedido: string;
  estabelecimento: { nome: string, telefone_contato: string }; // Se você incluiu a loja
  endereco_cliente: {
    titulo: string;
    logradouro: string;
    nome_endereco: string;
  }; // Se você incluiu o endereço
  forma_pagamento: { nome: string; ultimos_digitos?: string }; // Se você incluiu o pagamento
  pedido_itens: Array<{
    id: number;
    quantidade: number;
    valor_unitario_venda: number;
    catalogo_produto: {
      nome: string;
      produto: { detalhes: string };
    };
  }>;
}

// --- Fim Tipagens ---

export const PedidoService = {
  /**
   * Finaliza o pedido no backend.
   * O backend DEVE ser responsável por:
   * 1. Criar o registro do pedido.
   * 2. Limpar/Excluir o carrinho associado.
   * @param data Dados de endereço e pagamento.
   * @returns Detalhes básicos do pedido criado.
   */
  async createOrderFromCart(
    data: CreateOrderData
  ): Promise<PedidoCriadoResponse> {
    try {
      const token = await getAuthToken();
      const clientId = await getClientId();

      if (!token || !clientId) {
        throw new Error("Usuário não autenticado");
      }

      const payload = {
        idcarrinho: data.idcarrinho,
        cliente_idcliente: clientId,
        endereco_cliente_idendereco_cliente:
          data.endereco_cliente_idendereco_cliente,
        forma_pagamento_idforma_pagamento:
          data.forma_pagamento_idforma_pagamento,
        observacoes: data.observacoes || "",
      };

      const response = await api.post(`/pedidos`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 201) {
        // Se o backend retornar um status de erro, lança exceção
        throw new Error(
          response.data.message ||
            "Falha ao finalizar o pedido. Verifique os dados."
        );
      }

      // O backend deve retornar o ID do pedido criado
      const result: PedidoCriadoResponse = {
        idpedido: response.data.idpedido,
        message: response.data.message || "Pedido criado com sucesso!",
      };
      return result;
    } catch (error) {
      console.error("Erro no createOrder:", error);
      // Re-throw para ser pego pelo bloco try/catch da tela
      throw error;
    }
  },

  /**
   * Busca todos os pedidos do cliente logado.
   * @param clienteId ID do cliente (obtido via AuthService no frontend).
   * @returns Lista de pedidos no formato Order[].
   */
  async getOrdersByUserId(clienteId: string | number): Promise<Order[]> {
    try {
      const token = await getAuthToken();
      const idclient = await getClientId();

      if (!token || !clienteId) {
        // Lança erro se não houver autenticação/ID
        throw new Error("Dados de autenticação ou ID do cliente ausentes.");
      }

      // 🚨 ASSUMINDO que o endpoint para listar pedidos de um cliente é `/pedidos/cliente/:clienteId`
      // Se o seu backend usa o ID do token, o endpoint pode ser só `/pedidos/meus`
      const response = await api.get(`/pedidos/cliente/${idclient}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // O backend deve retornar uma lista de objetos Pedido
      const pedidosDoBackend: any[] = response.data;

      // Mapeia os dados do backend para o formato Order esperado pelo frontend
      const orders: Order[] = pedidosDoBackend.map((p) => ({
        id: p.idpedido, // Mapeia idpedido para id
        totalAmount: parseFloat(p.valor_total), // Garante que é um número
        status: p.status,
        createdAt: p.data_pedido || p.created_at, // Usa a coluna de data relevante
      }));

      return orders;
    } catch (error) {
      console.error("Erro ao buscar pedidos por ID de cliente:", error);
      // Re-throw para ser pego pelo bloco try/catch da tela
      throw error;
    }
  },

  async getOrderDetailsById(orderId: string | number): Promise<OrderDetail> {
    const token = await getAuthToken();
    const response = await api.get(`/pedidos/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Assumindo que o backend retorna o objeto Pedido completo
  },
};

export const { createOrderFromCart, getOrdersByUserId, getOrderDetailsById } =
  PedidoService;
