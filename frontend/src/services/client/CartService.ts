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

export interface EstabelecimentoDetails {
  id: number;
  name: string;
}

export interface CartDetails {
  idcarrinho: number; 
  estabelecimento: EstabelecimentoDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number; // Agora virá do cálculo do backend/frontend
  total: number; // O total final que inclui o subtotal + deliveryFee
}

export const CartService = {
  // Funções de getCart, addItem, updateQuantity, removeItem, clearCart (não alteradas)
  
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
      console.log('Dados do carrinho BRUTOS (Backend):', JSON.stringify(response.data, null, 2));
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
      let subtotalCalculado = 0;
      let estabelecimento: EstabelecimentoDetails = { id: 0, name: "Carrinho Vazio" };
      let taxaEntrega = 0.0;
      let valorMinimoEntrega = 0.0;
      let taxaAplicada = 0.0;

      if (carrinhoData.carrinho_item && carrinhoData.carrinho_item.length > 0) {
        
        const firstItem = carrinhoData.carrinho_item[0];
        const estabelecimentoData = firstItem?.catalogo_produto?.catalogo?.estabelecimento;
        
        if(estabelecimentoData) {
          taxaEntrega = parseFloat(estabelecimentoData.taxa_entrega || 0.0);
          valorMinimoEntrega = parseFloat(estabelecimentoData.valor_minimo_entrega || 0.0);

          estabelecimento = {
            id: estabelecimentoData.idestabelecimento || 0, 
            name: estabelecimentoData.razao_social || "Estabelecimento Desconhecido", 
          };
        }

        carrinhoData.carrinho_item.forEach((item: any) => {
          if (item.catalogo_produto && item.catalogo_produto.produto) {
            const price = parseFloat(item.catalogo_produto.valor_venda);
            const quantity = item.quantidade;

            // 1. CALCULA O SUBTOTAL (Soma de todos os itens)
            subtotalCalculado += price * quantity;

            cartItems.push({
              id: item.catalogo_produto.idcatalogo_produto.toString(),
              name: item.catalogo_produto.produto.nome_comercial,
              price: price,
              quantity: quantity,
              details: item.catalogo_produto.produto.apresentacao,
            });
          }
        });

        // Arredonda o subtotal para 2 casas decimais (importante para evitar problemas de float)
        const subtotalAtualizado = Math.round(subtotalCalculado * 100) / 100;
        
        // 2. LÓGICA DA TAXA DE ENTREGA: Frete Grátis se atingir o mínimo
        taxaAplicada = subtotalAtualizado >= valorMinimoEntrega ? 0.0 : taxaEntrega;
        
        // 3. CALCULA O TOTAL FINAL (Subtotal + Taxa)
        const totalFinal = subtotalAtualizado + taxaAplicada;

        return {
          idcarrinho: carrinhoData.idcarrinho,
          estabelecimento: estabelecimento,
          items: cartItems,
          subtotal: subtotalAtualizado,
          deliveryFee: taxaAplicada,
          total: totalFinal,
        };

      } else {
        // Carrinho vazio
        return {
          idcarrinho: carrinhoData.idcarrinho || 0,
          estabelecimento: { id: 0, name: "Carrinho Vazio" },
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
        };
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do carrinho para resumo:", error);
      throw error;
    }
  },
};