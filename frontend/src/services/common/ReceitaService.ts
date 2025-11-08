// services/client/ReceitaService.ts
import { API_URL } from "../../api/api";
import * as DocumentPicker from "expo-document-picker";
import { getAuthToken, isAuthenticated } from "./AuthService";

export const ReceitaService = {
  async uploadReceita(
    fileAsset: DocumentPicker.DocumentPickerAsset,
    pedidoId: string
  ): Promise<any> {
    // Verifica autenticação primeiro
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      throw new Error("Usuário não autenticado. Faça login novamente.");
    }

    // Valida o tipo de arquivo
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(fileAsset.mimeType || "")) {
      throw new Error("Tipo de arquivo não permitido. Use JPEG, PNG ou PDF.");
    }

    const formData = new FormData();

    // Corrige a criação do FormData
    formData.append("receitaFile", {
      uri: fileAsset.uri,
      name: fileAsset.name || `receita-${Date.now()}.jpg`,
      type: fileAsset.mimeType || "image/jpeg",
    } as any);

    formData.append("pedidoId", pedidoId);

    const token = await getAuthToken();

    try {
      const response = await fetch(`${API_URL}/upload/receita`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Não defina Content-Type manualmente para FormData
        },
        body: formData,
      });

      console.log("✅ Status da resposta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro detalhado:", errorText);

        if (response.status === 401) {
          throw new Error("Sessão expirada. Faça login novamente.");
        } else if (response.status === 413) {
          throw new Error("Arquivo muito grande.");
        } else if (response.status === 415) {
          throw new Error("Tipo de arquivo não suportado.");
        } else {
          throw new Error(`Falha no upload: ${response.status} - ${errorText}`);
        }
      }

      const result = await response.json();
      console.log("✅ Upload realizado com sucesso:", result);
      return result;
    } catch (error) {
      console.error("❌ Erro completo no upload:", error);
      throw error;
    }
  },

  // Método auxiliar para selecionar arquivo
  async pickReceita(): Promise<DocumentPicker.DocumentPickerResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        throw new Error("Seleção de arquivo cancelada");
      }

      return result;
    } catch (error) {
      console.error("Erro ao selecionar arquivo:", error);
      throw error;
    }
  },
};
