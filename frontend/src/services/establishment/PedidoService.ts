import api from "../../api/api";
import { getAuthToken, getEstablishmentId } from "../common/AuthService";
import { storeService } from "./storeService";

export interface Order {
  created_at: string | number | Date;
  updated_at: string | number | Date;
  idpedido: number;
  status: string;
  data_pedido: string;
  valor_total: string;
  cliente: {
    nome: string;
    numero_contato?: string;
  };
  endereco_cliente: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  pedido_itens: Array<{
    idpedido_item: number;
    quantidade: number;
    valor_unitario_venda: string;
    catalogo_produto: {
      produto: {
        nome_comercial: string;
        apresentacao: string;
      };
    };
  }>;
  forma_pagamento: {
    nome: string;
  };
}

export interface OrderStats {
  ordersToday: number;
  averageTime: string;
  revenue: number;
}

export const EstablishmentPedidoService = {

  async getOrdersByEstablishment(): Promise<Order[]> {
    try {
      console.log(
        "🔍 [SERVICE] Iniciando busca de pedidos do estabelecimento..."
      );

      const token = await getAuthToken();
      const establishmentId = await getEstablishmentId();

      console.log("🔍 [SERVICE] Token:", token ? "✅ Presente" : "❌ Ausente");
      console.log("🔍 [SERVICE] Establishment ID:", establishmentId);

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      if (!establishmentId) {
        throw new Error("ID do estabelecimento não encontrado");
      }

      console.log(
        "🔍 [SERVICE] Fazendo requisição para:",
        `/pedidos/estabelecimento/${establishmentId}`
      );

      const response = await api.get(
        `/pedidos/estabelecimento/${establishmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ [SERVICE] Resposta da API - Status:", response.status);
      console.log(
        "✅ [SERVICE] Número de pedidos recebidos:",
        Array.isArray(response.data) ? response.data.length : "Não é array"
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ [SERVICE] Erro detalhado ao buscar pedidos:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw error;
    }
  },

  async getTodayStats(): Promise<OrderStats> {
    try {
      console.log("📊 [SERVICE] Buscando estatísticas do dia...");

      const orders = await this.getOrdersByEstablishment();

      const today = new Date().toISOString().split("T")[0];
      console.log("📊 [SERVICE] Data de hoje para filtro:", today);

      const todayOrders = orders.filter((order) => {
        const orderDate = order.data_pedido.split("T")[0];
        return orderDate === today;
      });

      console.log("📊 [SERVICE] Pedidos de hoje:", todayOrders.length);

      const deliveredOrders = todayOrders.filter(
        (order) => order.status === "Entregue" || order.status === "entregue"
      );

      console.log(
        "📊 [SERVICE] Pedidos entregues para cálculo:",
        deliveredOrders.length
      );

      let averageTimeMinutes = 0;

      if (deliveredOrders.length > 0) {
        const totalTimeMinutes = deliveredOrders.reduce((total, order) => {
          try {
            const createdDate = new Date(order.created_at || order.data_pedido);
            const updatedDate = new Date(order.updated_at);

            if (isNaN(createdDate.getTime()) || isNaN(updatedDate.getTime())) {
              console.warn(
                "📊 [SERVICE] Data inválida no pedido:",
                order.idpedido
              );
              return total;
            }

            const timeDiffMinutes = Math.floor(
              (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60)
            );

            console.log(
              "📊 [SERVICE] Tempo do pedido",
              order.idpedido,
              ":",
              timeDiffMinutes,
              "minutos"
            );

            return total + Math.max(0, timeDiffMinutes);
          } catch (error) {
            console.error(
              "❌ [SERVICE] Erro ao calcular tempo do pedido",
              order.idpedido,
              ":",
              error
            );
            return total;
          }
        }, 0);

        averageTimeMinutes = Math.floor(
          totalTimeMinutes / deliveredOrders.length
        );
        console.log(
          "📊 [SERVICE] Tempo total:",
          totalTimeMinutes,
          "minutos, Média:",
          averageTimeMinutes,
          "minutos"
        );
      }

      let averageTimeFormatted = "0 min";
      if (averageTimeMinutes > 0) {
        if (averageTimeMinutes < 60) {
          averageTimeFormatted = `${averageTimeMinutes} min`;
        } else {
          const hours = Math.floor(averageTimeMinutes / 60);
          const minutes = averageTimeMinutes % 60;
          averageTimeFormatted =
            minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
        }
      }

      const revenue = todayOrders.reduce((sum, order) => {
        const valor =
          parseFloat(String(order.valor_total).replace(",", ".")) || 0;
        return sum + valor;
      }, 0);

      const ordersToday = todayOrders.length;

      console.log("📊 [SERVICE] Estatísticas finais:", {
        ordersToday,
        revenue,
        averageTime: averageTimeFormatted,
        pedidosEntregues: deliveredOrders.length,
      });

      return {
        ordersToday,
        averageTime: averageTimeFormatted,
        revenue,
      };
    } catch (error) {
      console.error("❌ [SERVICE] Erro ao buscar estatísticas:", error);
      return {
        ordersToday: 0,
        averageTime: "0 min",
        revenue: 0,
      };
    }
  },

  calculateOrderTime(order: Order): number {
    try {
      const createdDate = new Date(order.created_at || order.data_pedido);
      const updatedDate = new Date(order.updated_at);

      if (isNaN(createdDate.getTime()) || isNaN(updatedDate.getTime())) {
        return 0;
      }

      return Math.floor(
        (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60)
      );
    } catch (error) {
      console.error("❌ Erro ao calcular tempo do pedido:", error);
      return 0;
    }
  },




   async updateOrderStatus(orderId: string, newStatus: string): Promise<Order> {
    try {
      console.log("🔄 [SERVICE] Atualizando status do pedido:", { orderId, newStatus });

      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await api.put(
        `/pedidos/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ [SERVICE] Status atualizado com sucesso");
      return response.data;
    } catch (error: any) {
      console.error("❌ [SERVICE] Erro ao atualizar status:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

async getOrdersByEstablishmentDashboard(): Promise<Order[]> {
    try {
      console.log("🔍 [SERVICE] Iniciando busca de pedidos do estabelecimento...");

      const token = await getAuthToken();
      const establishmentId = await getEstablishmentId();

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      if (!establishmentId) {
        throw new Error("ID do estabelecimento não encontrado");
      }

      console.log(
        "🔍 [SERVICE] Fazendo requisição para:",
        `/pedidos/estabelecimento/${establishmentId}`
      );

      const response = await api.get(
        `/pedidos/estabelecimento/${establishmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ [SERVICE] Resposta da API - Status:", response.status);
      console.log(
        "✅ [SERVICE] Número total de pedidos recebidos:",
        Array.isArray(response.data) ? response.data.length : "Não é array"
      );

      const filteredOrders = await this.filterOrdersByBusinessHours(response.data);

      console.log(
        "✅ [SERVICE] Número de pedidos após filtro (horário funcionamento):",
        filteredOrders.length
      );

      return filteredOrders;
    } catch (error: any) {
      console.error("❌ [SERVICE] Erro detalhado ao buscar pedidos:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw error;
    }
  },

  async filterOrdersByBusinessHours(orders: Order[]): Promise<Order[]> {
    try {
      const isOpen = await storeService.getLoggedEstablishmentStatus();
      
      console.log("🏪 [SERVICE] Status do estabelecimento:", isOpen ? "ABERTO" : "FECHADO");

      if (!isOpen) {
        console.log("🚫 [SERVICE] Estabelecimento fechado - nenhum pedido será mostrado");
        return [];
      }

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(order => {
        try {
          const orderDate = new Date(order.data_pedido || order.created_at);
          const orderDateString = orderDate.toISOString().split('T')[0];
          return orderDateString === today;
        } catch (error) {
          console.error("❌ [SERVICE] Erro ao processar data do pedido:", order.idpedido);
          return false;
        }
      });

      console.log("✅ [SERVICE] Pedidos de hoje:", todayOrders.length);
      return todayOrders;
    } catch (error) {
      console.error("❌ [SERVICE] Erro ao verificar horário de funcionamento:", error);
      return orders;
    }
  },


};


