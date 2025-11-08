import api from "../../api/api";
import { Produto } from "../../types";
import { getAuthToken } from "../common";

interface TherapeuticClassObject {
  classe_terapeutica: string;
}
export const therapeuticClass = {
  async getProductsByClass(
    storeId: number,
    classe_terapeutica: string
  ): Promise<Produto[]> {
    try {
      const token = await getAuthToken();

      const response = await api.get<Produto[]>(`/produtos/por-classe`, {
        params: {
          classe: classe_terapeutica, 
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data; 
    } catch (error) {
      console.error(
        `Erro ao buscar produtos para a classe ${classe_terapeutica}:`,
        error
      );
      throw error;
    }
  },

  async getAllTherapeuticClasses(): Promise<TherapeuticClassObject[]> {
    try {
      return await this.getDistinctClassesFromBackend();
    } catch (error) {
      console.error("Erro ao buscar classes terapêuticas únicas:", error);
      throw error;
    }
  },

  async changeProductTherapeuticClass(
    idcatalogo_produto: string,
    newClass: string
  ): Promise<void> {
    try {
      await api.patch(`/catalogo-produto/${idcatalogo_produto}`, {
        classe_terapeutica: newClass,
      });
    } catch (error) {
      console.error(
        `Erro ao mudar a classe terapêutica do produto ${idcatalogo_produto}:`,
        error
      );
      throw error;
    }
  },

  async getDistinctClassesFromBackend(): Promise<string[]> {
    const token = await getAuthToken();
    try {
      const token = await getAuthToken();

      const response = await api.get<string[]>(
        `/produtos/classes-terapeuticas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data; 
    } catch (error) {
      console.error(
        "Erro ao buscar classes terapêuticas distintas do backend:",
        error
      );
      throw new Error("Falha ao carregar as classes terapêuticas.");
    }
  },
};
