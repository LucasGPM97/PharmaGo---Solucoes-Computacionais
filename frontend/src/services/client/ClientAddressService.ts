import api from "../../api/api";
import { getAuthToken, getUserId } from "../../services/common/AuthService";
export const MANAGE_LOCATION_NAME = "Localização Atual";

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  uf?: string;
  complement?: string;
  nome_endereco?: string;
  addressName?: string;
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

// Mapeamento para o backend
const mapToBackend = async (address: AddressData, clienteId: number) => {
  return {
    cliente_idcliente: clienteId,
    cep: address.cep.replace(/\D/g, ""),
    nome_endereco: address.addressName || "Endereço Principal",
    logradouro: address.street,
    numero: address.number,
    bairro: address.neighborhood,
    cidade: address.city,
    estado: address.state,
    uf: address.uf || address.state,
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

/**
 * Cria ou atualiza o endereço fixo "Localização Atual" do cliente.
 * * @param currentLocationData Objeto de endereço que já contém os dados geocodificados (rua, cep, lat/lon, etc.)
 * @returns O endereço salvo/atualizado com o idendereco_cliente.
 */
export const manageCurrentLocationAddress = async (
  currentLocationData: Omit<
    AddressData,
    "nome_endereco" | "idendereco_cliente"
  > & { latitude: string; longitude: string }
): Promise<AddressData> => {
  // 1. Prepara o payload completo, garantindo o nome fixo
  const payloadForBackend: AddressData = {
    ...currentLocationData,
    nome_endereco: MANAGE_LOCATION_NAME,
  };

  // 2. Busca endereços existentes
  const existingAddresses = await getEnderecosByCliente();

  // 3. Tenta encontrar o endereço com o nome fixo
  const locationAddress = existingAddresses.find(
    (addr) => addr.nome_endereco === MANAGE_LOCATION_NAME
  );

  let managedAddress: AddressData;

  if (locationAddress && locationAddress.idendereco_cliente) {
    // ATUALIZAÇÃO: O endereço "Localização Atual" já existe
    console.log(
      '🔄 Atualizando endereço "Localização Atual" (ID:',
      locationAddress.idendereco_cliente,
      ")"
    );

    managedAddress = await updateEnderecoCliente(
      locationAddress.idendereco_cliente,
      payloadForBackend
    );
  } else {
    // CRIAÇÃO: Cria um novo endereço com o nome "Localização Atual"
    console.log('➕ Criando novo endereço "Localização Atual"');

    // Chamada à função de criação
    const created = await createEnderecoCliente(payloadForBackend);
    managedAddress = { ...payloadForBackend, ...created };
  }

  // Retorna o endereço com o ID numérico
  return managedAddress;
};
