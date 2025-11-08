import api from "../../api/api";
import { getAuthToken, getUserId } from "../../services/common/AuthService";

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  nome_endereco?: string;
}

export interface EnderecoCliente {
  idendereco_cliente: number;
  cliente_idcliente: number;
  uf: string;
  nome_endereco: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: string;
  longitude: string;
  complemento?: string;
}

// ✅ FUNÇÃO PARA OBTER COORDENADAS PELO CEP (sem mostrar para usuário)
const getCoordinatesByCEP = async (
  cep: string,
  logradouro: string,
  cidade: string,
  estado: string
): Promise<{ latitude: string; longitude: string }> => {
  try {
    const cepLimpo = cep.replace(/\D/g, "");
    const enderecoCompleto = `${logradouro}, ${cidade}, ${estado}, Brasil`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        enderecoCompleto
      )}&countrycodes=br&limit=1`
    );

    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return { latitude: lat, longitude: lon };
    }

    // Fallback: busca apenas pelo CEP
    const responseByCEP = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&postalcode=${cepLimpo}&countrycodes=br&limit=1`
    );

    const dataByCEP = await responseByCEP.json();

    if (dataByCEP && dataByCEP.length > 0) {
      const { lat, lon } = dataByCEP[0];
      return { latitude: lat, longitude: lon };
    }

    return { latitude: "0.0", longitude: "0.0" };
  } catch (error) {
    console.error("Erro ao buscar coordenadas:", error);
    return { latitude: "0.0", longitude: "0.0" };
  }
};

// Mapeamento para o backend
const mapToBackend = async (address: AddressData, clienteId: number) => {
  // ✅ OBTÉM COORDENADAS AUTOMATICAMENTE
  const coordinates = await getCoordinatesByCEP(
    address.cep,
    address.street,
    address.city,
    address.state
  );

  return {
    cliente_idcliente: clienteId,
    cep: address.cep.replace(/\D/g, ""),
    nome_endereco: address.nome_endereco || "Endereço Principal",
    logradouro: address.street,
    numero: address.number,
    bairro: address.neighborhood,
    cidade: address.city,
    estado: address.state,
    uf: address.state,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    complemento: address.complement || null,
  };
};

// Mapeamento do backend para frontend
const mapToFrontend = (
  data: EnderecoCliente
): AddressData & { idendereco_cliente: number } => ({
  idendereco_cliente: data.idendereco_cliente,
  cep: data.cep,
  street: data.logradouro,
  number: data.numero,
  neighborhood: data.bairro,
  city: data.cidade,
  state: data.uf,
  complement: data.complemento,
  nome_endereco: data.nome_endereco,
});

// 1. CREATE - Criar endereço do cliente
export const createEnderecoCliente = async (
  address: AddressData
): Promise<AddressData & { idendereco_cliente: number }> => {
  const token = await getAuthToken();
  const clienteIdString = await getUserId();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }
  if (!clienteIdString) {
    throw new Error("ID do Cliente não encontrado.");
  }

  const clienteId = Number(clienteIdString);
  if (isNaN(clienteId)) {
    throw new Error("ID do Cliente inválido.");
  }

  const payload = await mapToBackend(address, clienteId);

  try {
    const response = await api.post<EnderecoCliente>(
      `/enderecos_cliente`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return mapToFrontend(response.data);
  } catch (error: any) {
    console.error("Erro ao criar endereço cliente:", error);
    throw error;
  }
};

// 2. GET - Buscar endereços do cliente
export const getEnderecosByCliente = async (): Promise<
  Array<AddressData & { idendereco_cliente: number }>
> => {
  const token = await getAuthToken();
  const clienteIdString = await getUserId();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }
  if (!clienteIdString) {
    throw new Error("ID do Cliente não encontrado.");
  }

  const clienteId = Number(clienteIdString);
  if (isNaN(clienteId)) {
    throw new Error("ID do Cliente inválido.");
  }

  try {
    const response = await api.get<EnderecoCliente[]>(
      `/enderecos_cliente/cliente/${clienteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.map(mapToFrontend);
  } catch (error: any) {
    console.error(`Erro ao buscar endereços cliente:`, error);

    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

// 3. UPDATE - Atualizar endereço do cliente
export const updateEnderecoCliente = async (
  idenderecoCliente: number,
  address: AddressData
): Promise<AddressData & { idendereco_cliente: number }> => {
  const token = await getAuthToken();
  const clienteIdString = await getUserId();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }
  if (!clienteIdString) {
    throw new Error("ID do Cliente não encontrado.");
  }

  const clienteId = Number(clienteIdString);
  if (isNaN(clienteId)) {
    throw new Error("ID do Cliente inválido.");
  }

  const payload = await mapToBackend(address, clienteId);

  try {
    const response = await api.put<EnderecoCliente>(
      `/enderecos_cliente/${idenderecoCliente}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return mapToFrontend(response.data);
  } catch (error: any) {
    console.error(`Erro ao atualizar endereço cliente:`, error);
    throw error;
  }
};

// 4. DELETE - Deletar endereço do cliente
export const deleteEnderecoCliente = async (
  idenderecoCliente: number
): Promise<void> => {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }

  try {
    await api.delete(`/enderecos_cliente/${idenderecoCliente}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error(`Erro ao deletar endereço cliente:`, error);
    throw error;
  }
};
