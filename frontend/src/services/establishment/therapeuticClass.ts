import api from "../../api/api";
import { Produto } from "../../types";
import { getAuthToken } from "../common";

interface TherapeuticClassObject {
  classe_terapeutica: string;
}
// Definir um novo serviço para trabalhar com classe terapêutica
export const therapeuticClass = {
  async getProductsByClass(
    storeId: number,
    classe_terapeutica: string
  ): Promise<Produto[]> {
    try {
      const token = await getAuthToken();

      // O PATH ESTÁ FALTANDO O PREFIXO: '/produtos/por-classe' ou o API_URL
      // Se o 'api' do axios já tem o prefixo '/produtos', o seu endpoint está correto como '/por-classe'
      // Assumindo que 'api' já contém o prefixo:
      const response = await api.get<Produto[]>(`/produtos/por-classe`, {
        params: {
          classe: classe_terapeutica, // Usa 'classe' como o cURL funcionou!
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data; // Retorna o array de produtos já filtrado pelo backend
    } catch (error) {
      console.error(
        `Erro ao buscar produtos para a classe ${classe_terapeutica}:`,
        error
      );
      throw error;
    }
  },

  // Obter todas as classes terapêuticas únicas
  async getAllTherapeuticClasses(): Promise<TherapeuticClassObject[]> {
    try {
      return await this.getDistinctClassesFromBackend();
    } catch (error) {
      console.error("Erro ao buscar classes terapêuticas únicas:", error);
      throw error;
    }
  },

  // Alternar classe terapêutica do produto (exemplo de funcionalidade, se necessário)
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

  // NOVO MÉTODO: Chama a rota otimizada do backend para obter classes distintas
  async getDistinctClassesFromBackend(): Promise<string[]> {
    const token = await getAuthToken();
    try {
      const token = await getAuthToken();

      // CHAMA A SUA NOVA ROTA OTIMIZADA: /produtos/classes-terapeuticas-distintas
      const response = await api.get<string[]>(
        `/produtos/classes-terapeuticas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data; // A API retorna diretamente um array de strings (classes)
    } catch (error) {
      console.error(
        "Erro ao buscar classes terapêuticas distintas do backend:",
        error
      );
      throw new Error("Falha ao carregar as classes terapêuticas.");
    }
  },
};
