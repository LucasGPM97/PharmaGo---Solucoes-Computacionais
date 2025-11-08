// Imports necessários (ajuste o caminho se necessário)
import api from "../../api/api";
import {
  getAuthToken,
  getEstablishmentId,
} from "../../services/common/AuthService";

// --------------------------------------------------------------------------------
// TIPOS (Ajustado para refletir o seu log)
// --------------------------------------------------------------------------------

// Tipo para os dados de cadastro do produto no Catálogo
export interface CatalogoRegistrationData {
  produto_idproduto: number;
  catalogo_idcatalogo: number;
  valor_venda: number;
  disponibilidade: boolean;
}

// Tipo para os dados de ATUALIZAÇÃO do Catálogo
export interface CatalogoUpdateData {
  valor_venda?: number; // Opcional, pois pode ser só a disponibilidade
  disponibilidade?: boolean; // Opcional, pois pode ser só o valor
}

// Tipos para os dados do Frontend
export interface Product {
  nome_comercial: string;
  classe_terapeutica: string;
  idcatalogoProduto: string; // ✅ Renomeado para clareza (ID do item do catálogo)
  nome: string;
  detentor_registro: string;
  registro_anvisa: string;
  valor_venda_display: string; // ✅ Alterado para 'display'
  valor_venda_numerico: number; // ✅ Novo campo para o valor real
  preco_cmed: string;
  substancia_ativa: string;
  disponibilidade: boolean;
  link_bula: string;
  isExpanded?: boolean;
  isEditing?: boolean;
}

// Resposta esperada da API
export interface ApiProductResponse {
  idcatalogo_produto: number;
  valor_venda: string; // ✅ É uma string (DECIMAL) no seu log
  disponibilidade: boolean;
  produto: {
    // ✅ CORRETO: O objeto aninhado se chama 'produto'
    idproduto: number;
    nome_comercial: string; // ✅ Campo correto do seu log
    registro_anvisa: string;
    detentor_registro: string; // ✅ Campo correto do seu log
    preco_cmed: string; // ✅ É uma string no seu log
    substancia_ativa: string;
    link_bula: string;
    classe_terapeutica: string;
    tipo_produto: string;
    apresentacao: string;
    requer_receita: boolean;
    tarja: string;
  };
  // ... outros campos do CatalogoProduto
}

interface CatalogoProdutoResponse {
  idcatalogo_produto: number;
  // ...
}

// --------------------------------------------------------------------------------
// FUNÇÕES AUXILIARES DE PREÇO (Essenciais para resolver o TypeError)
// --------------------------------------------------------------------------------

// Converte string de API para valor numérico (útil para cálculos)
const parsePrice = (value: string | number | undefined | null): number => {
  const rawValue = String(value || 0).replace(",", ".");
  const numValue = parseFloat(rawValue);
  return isNaN(numValue) ? 0 : numValue;
};

// Formata valor da API (string/number) para a string de exibição "R$ X,XX"
const formatPrice = (value: string | number | undefined | null): string => {
  const numValue = parsePrice(value);

  if (numValue === 0) {
    return "R$ 0,00";
  }

  return `R$ ${numValue.toFixed(2).replace(".", ",")}`;
};

// --------------------------------------------------------------------------------
// FUNÇÃO 1: BUSCAR PRODUTOS (Corrigida)
// --------------------------------------------------------------------------------

export const getCatalogProducts = async (): Promise<Product[]> => {
  const token = await getAuthToken();
  const catalogId = await getEstablishmentId();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  try {
    const response = await api.get<ApiProductResponse[]>(
      `/catalogo-produtos/estabelecimento/${catalogId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 2. Mapeia a resposta da API com os CAMINHOS CORRETOS
    const formattedProducts: Product[] = response.data.map((apiItem) => ({
      idcatalogoProduto: apiItem.idcatalogo_produto.toString(),
      disponibilidade: apiItem.disponibilidade,

      // PREÇOS
      valor_venda_display: formatPrice(apiItem.valor_venda),
      valor_venda_numerico: parsePrice(apiItem.valor_venda), // Valor para o input de edição
      preco_cmed: formatPrice(apiItem.produto.preco_cmed),

      // DADOS DO PRODUTO (Aninhados corretamente em apiItem.produto)
      nome: apiItem.produto.nome_comercial, // ✅ CORRETO
      detentor_registro: apiItem.produto.detentor_registro, // ✅ CORRETO
      registro_anvisa: apiItem.produto.registro_anvisa, // ✅ CORRETO
      substancia_ativa: apiItem.produto.substancia_ativa,
      link_bula: apiItem.produto.link_bula,
      classe_terapeutica: apiItem.produto.classe_terapeutica,
      tarja: apiItem.produto.tarja,
      tipo_produto: apiItem.produto.tipo_produto,

      // ESTADOS DE UI
      isExpanded: false,
      isEditing: false,
    }));

    return formattedProducts;
  } catch (error) {
    console.error("Erro ao buscar produtos do catálogo:", error);
    throw error;
  }
};

// --------------------------------------------------------------------------------
// FUNÇÃO 2: REGISTRAR PRODUTO NO CATÁLOGO (Mantida)
// --------------------------------------------------------------------------------

export const registerProductToCatalog = async (
  data: CatalogoRegistrationData
): Promise<CatalogoProdutoResponse> => {
  // ... (código que você forneceu, mantido intacto)
  const token = await getAuthToken();

  if (!token) {
    throw new Error(
      "Token de autenticação não encontrado. Usuário não autenticado."
    );
  }

  const {
    produto_idproduto,
    catalogo_idcatalogo,
    valor_venda,
    disponibilidade,
  } = data;

  try {
    const catalogoProdutoResponse = await api.post<CatalogoProdutoResponse>(
      "/catalogo-produtos",
      {
        catalogo_idcatalogo: catalogo_idcatalogo,
        produto_idproduto: produto_idproduto,
        valor_venda: Number(valor_venda),
        disponibilidade: disponibilidade,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return catalogoProdutoResponse.data;
  } catch (error) {
    console.error("Erro ao registrar produto no catálogo:", error);
    throw error;
  }
};

// --------------------------------------------------------------------------------
// FUNÇÃO 3: ATUALIZAR ITEM DO CATÁLOGO (NOVA)
// --------------------------------------------------------------------------------

/**
 * Atualiza o preço de venda ou a disponibilidade de um item específico do catálogo.
 * @param idcatalogoProduto O ID do item na tabela CatalogoProduto (ex: '2', '3', '4').
 * @param data O objeto com valor_venda e/ou disponibilidade a ser atualizado.
 */
export const updateCatalogItem = async (
  idcatalogoProduto: string,
  data: CatalogoUpdateData
): Promise<CatalogoProdutoResponse> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  // O payload inclui apenas os campos que você deseja atualizar
  const payload = {
    ...(data.valor_venda !== undefined && { valor_venda: data.valor_venda }),
    ...(data.disponibilidade !== undefined && {
      disponibilidade: data.disponibilidade,
    }),
  };

  if (Object.keys(payload).length === 0) {
    throw new Error("Nenhum dado de atualização fornecido.");
  }

  try {
    // Rota de PATCH: '/catalogo-produtos/:idcatalogoProduto'
    const response = await api.patch<CatalogoProdutoResponse>(
      `/catalogo-produtos/${idcatalogoProduto}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Erro ao atualizar item do catálogo ID ${idcatalogoProduto}:`,
      error
    );
    throw error;
  }
};

/**
 * Remove um item do catálogo (CatalogoProduto) pelo seu ID.
 * @param idcatalogoProduto O ID do item na tabela CatalogoProduto (ex: '2', '3', '4').
 */
export const deleteCatalogItem = async (
  idcatalogoProduto: string
): Promise<void> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  try {
    // Rota de DELETE: '/catalogo-produtos/:idcatalogoProduto'
    await api.delete(`/catalogo-produtos/${idcatalogoProduto}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(
      `Erro ao deletar item do catálogo ID ${idcatalogoProduto}:`,
      error
    );
    throw error;
  }
};

export const getCatalogProducts2 = async (
  storeId: string
): Promise<Product[]> => {
  try {
    const token = await getAuthToken(); // Pega o token

    // 🚨 VERIFIQUE ESTA LINHA:
    // A rota deve incluir o storeId se a API exigir
    const response = await api.get<Product[]>(
      `/catalogo-produtos/estabelecimento/${storeId}`,
      {
        // ⚠️ ASSUME ESTE FORMATO DE ROTA
        headers: {
          Authorization: `Bearer ${token}`, // ⚠️ VERIFIQUE SE O TOKEN ESTÁ AQUI
        },
      }
    );

    // Garantir que a requisição só é bem-sucedida se o status for 2xx
    return response.data;
  } catch (error: any) {
    console.error("Erro ao buscar produtos do catálogo:", error); // Este é o seu log
    // 🛑 PARA EVITAR O CRASH: Retorne um array vazio aqui.
    return [];
  }
};

export const getProductById = async (productId: string): Promise<Product> => {
  try {
    // Validação robusta do ID
    if (!productId || productId === "undefined" || productId === "null") {
      throw new Error("ID do produto inválido: " + productId);
    }

    const token = await getAuthToken();

    if (!token) {
      throw new Error("Token de autenticação não encontrado.");
    }

    console.log("✅ Buscando produto por ID válido:", productId);

    const response = await api.get<ApiProductResponse>(
      `/catalogo-produtos/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Resposta da API (produto por ID):", response.data);

    const apiItem = response.data;

    return {
      idcatalogoProduto: apiItem.idcatalogo_produto.toString(),
      disponibilidade: apiItem.disponibilidade,
      valor_venda_display: formatPrice(apiItem.valor_venda),
      valor_venda_numerico: parsePrice(apiItem.valor_venda),
      preco_cmed: formatPrice(apiItem.produto.preco_cmed),
      nome: apiItem.produto.nome_comercial,
      nome_comercial: apiItem.produto.nome_comercial,
      detentor_registro: apiItem.produto.detentor_registro,
      registro_anvisa: apiItem.produto.registro_anvisa,
      substancia_ativa: apiItem.produto.substancia_ativa,
      link_bula: apiItem.produto.link_bula,
      classe_terapeutica: apiItem.produto.classe_terapeutica,
      apresentacao: apiItem.produto.apresentacao,
      tarja: apiItem.produto.tarja,
      requer_receita: apiItem.produto.requer_receita,
      tipo_produto: apiItem.produto.tipo_produto,
      isExpanded: false,
      isEditing: false,
    };
  } catch (error: any) {
    console.error("❌ Erro ao buscar produto por ID:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });
    throw error;
  }
};
