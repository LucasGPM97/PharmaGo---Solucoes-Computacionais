// services/client/CartService.ts
import api from "../../api/api";
import { getAuthToken, getClientId } from "../common/AuthService";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  details?: string;
  estabelecimente_id?: number;
}

// Tipagem da Loja
export interface EstabelecimentoDetails {
  id: number;
  name: string;
}

// Tipagem COMPLETA para o Resumo do Pedido
export interface CartDetails {
  idcarrinho: number; // Precisamos do id do carrinho para o checkout
  estabelecimento: EstabelecimentoDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// Serviço para integrar com a API do backend
export const CartService = {
  // Buscar carrinho do cliente
  async getCart(): Promise<CartItem[]> {
    try {
      const token = await getAuthToken();
      const clientId = await getClientId();

      if (!token || !clientId) {
        throw new Error("Usuário não autenticado");
      }

      const response = await api.get(`/carrinho/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // 💡 LOG CRÍTICO
      console.log('Dados do carrinho BRUTOS (Backend):', JSON.stringify(response.data, null, 2));
      // Converter da resposta da API para o formato do frontend
      const carrinhoData = response.data;
      const cartItems: CartItem[] = [];

      if (carrinhoData.carrinho_item && carrinhoData.carrinho_item.length > 0) {
        carrinhoData.carrinho_item.forEach((item: any) => {
          if (item.catalogo_produto && item.catalogo_produto.produto) {
            cartItems.push({
              id: item.catalogo_produto.idcatalogo_produto.toString(),
              name: item.catalogo_produto.produto.nome_comercial,
              price: parseFloat(item.catalogo_produto.valor_venda),
              quantity: item.quantidade,
              details: item.catalogo_produto.produto.apresentacao,
            });
          }
        });
      }

      return cartItems;
    } catch (error) {
      console.error("Erro ao buscar carrinho:", error);
      throw error;
    }
  },

  // Adicionar item ao carrinho
  async addItem(productId: string, quantity: number = 1): Promise<void> {
    try {
      const token = await getAuthToken();
      const clientId = await getClientId();

      if (!token || !clientId) {
        throw new Error("Usuário não autenticado");
      }

      // Primeiro busca o carrinho para obter o idcarrinho
      const carrinhoResponse = await api.get(`/carrinho/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const idcarrinho = carrinhoResponse.data.idcarrinho;

      await api.post(
        `/carrinho/${idcarrinho}/item`,
        {
          idcatalogo_produto: parseInt(productId),
          quantidade: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
      throw error;
    }
  },

  // Atualizar quantidade do item
  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    try {
      const token = await getAuthToken();
      const clientId = await getClientId();

      if (!token || !clientId) {
        throw new Error("Usuário não autenticado");
      }

      // Primeiro busca o carrinho para obter o idcarrinho
      const carrinhoResponse = await api.get(`/carrinho/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const idcarrinho = carrinhoResponse.data.idcarrinho;

      await api.put(
        `/carrinho/${idcarrinho}/item/${itemId}`,
        {
          quantidade: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      throw error;
    }
  },

  // Remover item do carrinho
  async removeItem(itemId: string): Promise<void> {
    try {
      const token = await getAuthToken();
      const clientId = await getClientId();

      if (!token || !clientId) {
        throw new Error("Usuário não autenticado");
      }

      // Primeiro busca o carrinho para obter o idcarrinho
      const carrinhoResponse = await api.get(`/carrinho/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const idcarrinho = carrinhoResponse.data.idcarrinho;

      await api.delete(`/carrinho/${idcarrinho}/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Erro ao remover item do carrinho:", error);
      throw error;
    }
  },

  // Limpar carrinho
  async clearCart(): Promise<void> {
    try {
      const token = await getAuthToken();
      const clientId = await getClientId();

      if (!token || !clientId) {
        throw new Error("Usuário não autenticado");
      }

      // Primeiro busca o carrinho para obter o idcarrinho
      const carrinhoResponse = await api.get(`/carrinho/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const idcarrinho = carrinhoResponse.data.idcarrinho;

      await api.delete(`/carrinho/${idcarrinho}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error);
      throw error;
    }
  },

  async getCartDetails(): Promise<CartDetails> {
    try {
      const token = await getAuthToken();
      const clientId = await getClientId();

      if (!token || !clientId) {
        throw new Error("Usuário não autenticado");
      }

      const response = await api.get(`/carrinho/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const carrinhoData = response.data;
      const cartItems: CartItem[] = [];
      let subtotalCalculado = 0; // Usaremos este para calcular o total com a taxa de entrega

      // 1. Processamento e Cálculo do Subtotal
      if (carrinhoData.carrinho_item && carrinhoData.carrinho_item.length > 0) {
        carrinhoData.carrinho_item.forEach((item: any) => {
          if (item.catalogo_produto && item.catalogo_produto.produto) {
            const price = parseFloat(item.catalogo_produto.valor_venda);
            const quantity = item.quantidade;

            subtotalCalculado += price * quantity;

            cartItems.push({
              // 🚨 CORREÇÃO: Usar o caminho correto para o ID do produto no catálogo
              id: item.catalogo_produto.idcatalogo_produto.toString(),
              name: item.catalogo_produto.produto.nome_comercial,
              price: price,
              quantity: quantity,
              details: item.catalogo_produto.produto.apresentacao,
            });
          }
        });
      } else {
        // Retorna dados de carrinho vazio para evitar erros
        return {
          idcarrinho: carrinhoData.idcarrinho || 0,
          estabelecimento: { id: 0, name: "Carrinho Vazio" },
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
        };
      }

      // 2. Determinação do Subtotal e Loja (se não vierem na raiz do carrinho)
      // Se o backend enviar um total, usamos ele como subtotal:
      const subtotal = parseFloat(
        carrinhoData.total || subtotalCalculado.toFixed(2)
      );

      // Hardcoded: Você deve obter a taxa de entrega da API, não fixar no front
      const deliveryFee = 7.9;
      const totalFinal = subtotal + deliveryFee;

      // 🚨 SOLUÇÃO PARA O CAMPO ESTABELECIMENTO: Pega o ID do catálogo do primeiro item como referência
      const firstItem = carrinhoData.carrinho_item[0];
      const estabelecimento: EstabelecimentoDetails = {
        id: firstItem?.catalogo_produto?.catalogo_idcatalogo || 1, // ID do Catálogo (geralmente 1:1 com a loja)
        name: "Loja Padrão Central", // Use um nome fixo ou busque de outra forma
      };
      // ----------------------------------------------------

      return {
        idcarrinho: carrinhoData.idcarrinho,
        estabelecimento: estabelecimento,
        items: cartItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: totalFinal,
      };
    } catch (error) {
      console.error("Erro ao buscar detalhes do carrinho para resumo:", error);
      // Re-throw para ser pego pelo bloco try/catch da tela
      throw error;
    }
  },
};
