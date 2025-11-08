// services/client/ClientService.ts
import api from "../../api/api";
import { getAuthToken, getClientId } from "../../services/common/AuthService";

export type Cliente = {
  idcliente: number;
  email: string;
  nome: string;
  senha?: string;
  documento_identificacao: string;
  data_nascimento: string;
  numero_contato: string;
  imagem_perfil_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type UpdateClienteData = {
  nome?: string;
  email?: string;
  numero_contato?: string;
  data_nascimento?: string;
  imagem_perfil_url?: string;
};

export const getClienteById = async (): Promise<Cliente> => {
  const token = await getAuthToken();
  const clientid = await getClientId();
  console.log(clientid);
  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  if (!clientid) {
    throw new Error("ID do Cliente não encontrado");
  }

  try {
    const response = await api.get<Cliente>(`/clientes/${clientid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao buscar cliente:", error);
    throw new Error(
      error.response?.data?.message || "Erro ao carregar dados do cliente"
    );
  }
};

export const updateCliente = async (
  data: UpdateClienteData
): Promise<Cliente> => {
  const token = await getAuthToken();
  const clientid = await getClientId();

  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  if (!clientid) {
    throw new Error("ID do Cliente não encontrado");
  }

  try {
    const response = await api.put<Cliente>(`/clientes/${clientid}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error);
    throw new Error(
      error.response?.data?.message || "Erro ao atualizar dados do cliente"
    );
  }
};

// Função auxiliar para obter o ID do cliente
export const getCurrentClienteId = async (): Promise<number | null> => {
  try {
    const clientid = await getClientId();
    return clientid ? Number(clientid) : null;
  } catch (error) {
    console.error("Erro ao obter ID do cliente:", error);
    return null;
  }
};
