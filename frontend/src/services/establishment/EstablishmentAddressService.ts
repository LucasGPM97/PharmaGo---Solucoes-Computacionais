import api from "../../api/api";
import {
  getAuthToken,
  getEstablishmentId,
} from "../../services/common/AuthService";

import { EnderecoEstabelecimento } from "../../types";

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}

// CORREÇÃO: Mapeamento para o backend
const mapToBackend = (address: AddressData, estabelecimentoId: number) => ({
  estabelecimento_idestabelecimento: estabelecimentoId,
  cep: address.cep.replace(/\D/g, ""),
  logradouro: address.street,
  numero: address.number,
  bairro: address.neighborhood,
  cidade: address.city,
  estado: address.state, // Nome completo do estado
  uf: address.state, // Sigla do estado
  latitude: "0.0",
  longitude: "0.0",
  complemento: address.complement || null,
});

// CORREÇÃO: Mapeamento do backend para frontend
const mapToFrontend = (
  data: EnderecoEstabelecimento
): AddressData & { idendereco_estabelecimento: number } => ({
  idendereco_estabelecimento: data.idendereco_estabelecimento,
  cep: data.cep,
  street: data.logradouro,
  number: data.numero,
  neighborhood: data.bairro,
  city: data.cidade,
  state: data.uf, // Usa a UF do backend
  complement: data.complemento,
});

// CORREÇÃO: Todas as rotas agora usam o prefixo correto "/enderecos_estabelecimento"

// 1. CREATE
export const createEnderecoEstabelecimento = async (
  address: AddressData
): Promise<AddressData & { idendereco_estabelecimento: number }> => {
  const token = await getAuthToken();
  const estabelecimentoId = await getEstablishmentId();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }
  if (!estabelecimentoId) {
    throw new Error("ID do Estabelecimento não encontrado.");
  }

  const payload = mapToBackend(address, Number(estabelecimentoId));

  try {
    console.log("📍 Enviando CREATE endereço:", {
      estabelecimentoId,
      payload,
    });

    // CORREÇÃO: Rota correta com prefixo
    const response = await api.post<EnderecoEstabelecimento>(
      `/enderecos_estabelecimento`, // ✅ CORRIGIDO: enderecos_estabelecimento (com s)
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Endereço criado com sucesso:", response.data);
    return mapToFrontend(response.data);
  } catch (error: any) {
    console.error("❌ Erro detalhado ao criar endereço:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      payload: payload,
    });
    throw error;
  }
};

// 2. UPDATE
export const updateEnderecoEstabelecimento = async (
  idenderecoEstabelecimento: number,
  address: AddressData
): Promise<AddressData & { idendereco_estabelecimento: number }> => {
  const token = await getAuthToken();
  const estabelecimentoId = await getEstablishmentId();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }
  if (!estabelecimentoId) {
    throw new Error("ID do Estabelecimento não encontrado.");
  }

  const payload = mapToBackend(address, Number(estabelecimentoId));

  try {
    console.log("📍 Enviando UPDATE endereço:", {
      idenderecoEstabelecimento,
      estabelecimentoId,
      payload,
    });

    // CORREÇÃO: Rota correta com prefixo
    const response = await api.put<EnderecoEstabelecimento>(
      `/enderecos_estabelecimento/${idenderecoEstabelecimento}`, // ✅ CORRIGIDO
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Endereço atualizado com sucesso:", response.data);
    return mapToFrontend(response.data);
  } catch (error: any) {
    console.error(
      `❌ Erro detalhado ao atualizar endereço ID ${idenderecoEstabelecimento}:`,
      {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      }
    );
    throw error;
  }
};

// 3. FIND BY ESTABELECIMENTO ID
export const getEnderecosByEstabelecimento = async (): Promise<
  Array<AddressData & { idendereco_estabelecimento: number }>
> => {
  const token = await getAuthToken();
  const estabelecimentoId = await getEstablishmentId();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }
  if (!estabelecimentoId) {
    throw new Error("ID do Estabelecimento não encontrado.");
  }

  try {
    console.log(
      "📍 Buscando endereços para estabelecimento ID:",
      estabelecimentoId
    );

    // CORREÇÃO: Rota correta com prefixo e parâmetro correto
    const response = await api.get<EnderecoEstabelecimento[]>(
      `/enderecos_estabelecimento/estabelecimento/${estabelecimentoId}`, // ✅ CORRIGIDO
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Endereços encontrados:", response.data);
    return response.data.map(mapToFrontend);
  } catch (error: any) {
    console.error(`❌ Erro detalhado ao buscar endereços:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    // Se for 404, pode ser que não existam endereços ainda - retorna array vazio
    if (error.response?.status === 404) {
      console.log(
        "ℹ️  Nenhum endereço encontrado (404), retornando array vazio"
      );
      return [];
    }
    throw error;
  }
};

// 4. FIND BY ID
export const getEnderecoById = async (
  idenderecoEstabelecimento: number
): Promise<AddressData & { idendereco_estabelecimento: number }> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  try {
    // CORREÇÃO: Rota correta com prefixo
    const response = await api.get<EnderecoEstabelecimento>(
      `/enderecos_estabelecimento/${idenderecoEstabelecimento}`, // ✅ CORRIGIDO
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return mapToFrontend(response.data);
  } catch (error: any) {
    console.error(
      `❌ Erro ao buscar endereço ID ${idenderecoEstabelecimento}:`,
      {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }
    );
    throw error;
  }
};

// 5. DELETE
export const deleteEnderecoEstabelecimento = async (
  idenderecoEstabelecimento: number
): Promise<void> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  try {
    // CORREÇÃO: Rota correta com prefixo
    await api.delete(
      `/enderecos_estabelecimento/${idenderecoEstabelecimento}`, // ✅ CORRIGIDO
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("✅ Endereço deletado com sucesso");
  } catch (error: any) {
    console.error(
      `❌ Erro ao deletar endereço ID ${idenderecoEstabelecimento}:`,
      {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }
    );
    throw error;
  }
};
