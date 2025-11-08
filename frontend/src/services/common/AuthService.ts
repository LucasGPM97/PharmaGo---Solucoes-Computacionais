import api from "../../api/api";
import { AuthResponse } from "../../types";
import { Cliente, Estabelecimento } from "../../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos de resposta do backend (ajustados para serem mais limpos)
interface ClientLoginResponse {
  token: string;
  cliente: Cliente;
}

interface EstablishmentLoginResponse {
  token: string;
  estabelecimento: Estabelecimento;
}

// Funções de Login e Registro

export const loginClient = async (
  emailOrCnpj: string,
  password: string
): Promise<ClientLoginResponse> => {
  try {
    const response = await api.post<ClientLoginResponse>("/auth/loginCliente", {
      email: emailOrCnpj,
      senha: password,
    });

    // Salvar token e dados do cliente
    await saveAuthData(
      response.data.token,
      response.data.cliente.idcliente,
      response.data.cliente,
      "cliente"
    );

    return response.data;
  } catch (error) {
    console.error("Login client error:", error);
    throw error;
  }
};

export const registerClient = async (
  clientData: Omit<Cliente, "idcliente"> & { senha: string }
): Promise<Cliente> => {
  const response = await api.post<Cliente>("/auth/registerCliente", clientData);
  return response.data;
};

export const loginEstablishment = async (
  emailOrCnpj: string,
  password: string
): Promise<EstablishmentLoginResponse> => {
  try {
    const response = await api.post<EstablishmentLoginResponse>(
      "/auth/loginEstabelecimento",
      {
        email: emailOrCnpj,
        senha: password,
      }
    );

    // Salvar token e dados do estabelecimento
    await saveAuthData(
      response.data.token,
      response.data.estabelecimento.idestabelecimento,
      response.data.estabelecimento,
      "estabelecimento"
    );

    return response.data;
  } catch (error: any) {
    console.error("Login establishment error:", error);
    throw error;
  }
};

export const registerEstablishment = async (
  establishmentData: Omit<Estabelecimento, "idestabelecimento"> & {
    senha: string;
  }
): Promise<Estabelecimento> => {
  const response = await api.post<Estabelecimento>(
    "/auth/registerEstabelecimento",
    establishmentData
  );
  return response.data;
};

// Funções de Gerenciamento de Autenticação (Mantidas no comum)

// Salvar todos os dados de autenticação
export const saveAuthData = async (
  token: string,
  userId: number, // Alterado para number
  userData: Cliente | Estabelecimento,
  userType: "cliente" | "estabelecimento"
): Promise<void> => {
  try {
    // Converter tudo para string (AsyncStorage só aceita strings)
    const userIdString = String(userId);
    const userDataString = JSON.stringify(userData);

    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("userId", userIdString);
    await AsyncStorage.setItem("userType", userType);
    await AsyncStorage.setItem("userData", userDataString);

    console.log("✅ Dados de autenticação salvos com sucesso");
  } catch (error) {
    console.error("❌ Erro ao salvar dados de autenticação:", error);
    throw error;
  }
};

// Obter token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    return token;
  } catch (error) {
    console.error("Erro ao obter token:", error);
    return null;
  }
};

// Obter ID do usuário
export const getUserId = async (): Promise<string | null> => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    return userId;
  } catch (error) {
    console.error("Erro ao obter userId:", error);
    return null;
  }
};

// Obter tipo do usuário
export const getUserType = async (): Promise<
  "cliente" | "estabelecimento" | null
> => {
  try {
    const userType = (await AsyncStorage.getItem("userType")) as
      | "cliente"
      | "estabelecimento";
    return userType;
  } catch (error) {
    console.error("Erro ao obter userType:", error);
    return null;
  }
};

// Obter dados do usuário
export const getUserData = async (): Promise<
  Cliente | Estabelecimento | null
> => {
  try {
    const data = await AsyncStorage.getItem("userData");
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error);
    return null;
  }
};

// Verificar se está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    const userId = await getUserId();
    return !!(token && userId);
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
};

// Remover todos os dados (logout)
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      "authToken",
      "userId",
      "userType",
      "userData",
      "establishmentId", // manter por compatibilidade
      "establishmentData", // manter por compatibilidade
    ]);
    console.log("✅ Dados de autenticação removidos com sucesso");
  } catch (error) {
    console.error("❌ Erro ao remover dados de autenticação:", error);
    throw error;
  }
};

// Funções de compatibilidade (mantidas para não quebrar código existente)
export const getEstablishmentId = async (): Promise<string | null> => {
  const userType = await getUserType();
  if (userType === "estabelecimento") {
    return getUserId();
  }
  return null;
};

export const getEstablishmentData =
  async (): Promise<Estabelecimento | null> => {
    const userType = await getUserType();
    if (userType === "estabelecimento") {
      return getUserData() as Promise<Estabelecimento | null>;
    }
    return null;
  };

export const getClientId = async (): Promise<string | null> => {
  const userType = await getUserType();
  if (userType === "cliente") {
    return getUserId();
  }
  return null;
};

export const getClientData = async (): Promise<Cliente | null> => {
  const userType = await getUserType();
  if (userType === "cliente") {
    return getUserData() as Promise<Cliente | null>;
  }
  return null;
};
