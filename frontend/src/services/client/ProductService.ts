import api from "../../api/api";

export interface Product {
  id: string;
  nome_comercial: string;
  substancia_ativa: string;
  descricao?: string;
  valor_venda: number;
  imageUrl?: string;
}

export const getProductsByEstablishment = async (
  establishmentId: string
): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>(
      `/catalogo-produtos/estabelecimento/${establishmentId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Erro ao buscar produtos para o estabelecimento ${establishmentId}:`,
      error
    );
    throw error;
  }
};

export const getProductById = async (productId: string): Promise<Product> => {
  try {
    const response = await api.get<Product>(`/produtos/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produto ${productId}:`, error);
    throw error;
  }
};
