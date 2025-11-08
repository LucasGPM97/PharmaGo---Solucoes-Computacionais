import api from "../../api/api";
import { Estabelecimento, Produto } from "../../types";
import { getAuthToken, getEstablishmentId } from "../common";
import { EnderecoEstabelecimento } from "../../types";

export interface HorarioUpdate {
  idhorario_funcionamento: number | undefined;
  fechado: boolean;
  horario_abertura: string; // Formato "HH:mm"
  horario_fechamento: string; // Formato "HH:mm"
  dia: number; // 0=Domingo, 1=Segunda...
}

// 🚨 FUNÇÃO DE CÁLCULO: Verifica se o horário atual está dentro do horário de funcionamento
// Esta lógica foi mantida
const checkIfOpen = (horarios: HorarioUpdate[]): boolean => {
  if (!horarios || horarios.length === 0) {
    return false;
  }

  const now = new Date(); // getDay() retorna 0 para Domingo, 1 para Segunda, etc.
  const currentDay = now.getDay();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  const todaySchedule = horarios.find((h) => h.dia === currentDay); // Se não há horário definido para hoje ou se está explicitamente fechado (fechado: true)

  if (!todaySchedule || todaySchedule.fechado) {
    return false;
  }

  try {
    const [openHourStr, openMinuteStr] =
      todaySchedule.horario_abertura.split(":");
    const [closeHourStr, closeMinuteStr] =
      todaySchedule.horario_fechamento.split(":");

    const openTimeInMinutes =
      parseInt(openHourStr) * 60 + parseInt(openMinuteStr);
    const closeTimeInMinutes =
      parseInt(closeHourStr) * 60 + parseInt(closeMinuteStr); // Verificação para horários que cruzam a meia-noite (ex: 22:00 - 02:00)

    if (openTimeInMinutes > closeTimeInMinutes) {
      // Está aberto se for: Depois do horário de abertura (dia D) OU Antes do fechamento (madrugada D+1)
      return (
        currentTimeInMinutes >= openTimeInMinutes ||
        currentTimeInMinutes <= closeTimeInMinutes
      );
    } else {
      // Horário normal no mesmo dia (ex: 08:00 - 18:00)
      return (
        currentTimeInMinutes >= openTimeInMinutes &&
        currentTimeInMinutes <= closeTimeInMinutes
      );
    }
  } catch (e) {
    console.warn("Erro ao processar horário de funcionamento:", e);
    return false; // Falha na leitura do horário
  }
};

// 🚨 Tipo de Resposta Esperada da API para o Estabelecimento
interface EstabelecimentoComHorarios extends Estabelecimento {
  // Assumindo que o campo retornado pela API é 'horario_funcionamento' (singular/plural inconsistente)
  horario_funcionamento?: HorarioUpdate[];
}

// 🚨 FUNÇÃO CORRIGIDA - Agora faz parte do service
const getLoggedEstablishmentStatus = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    const establishmentId = await getEstablishmentId();

    if (!establishmentId) {
      console.error("ID do estabelecimento não encontrado.");
      return false;
    }

    const response = await api.get<EstabelecimentoComHorarios>(
      `/estabelecimentos/${establishmentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const establishmentData = response.data;
    // O campo usado aqui ('horario_funcionamento') é o que eu ajustei na interface
    const horarios = establishmentData.horario_funcionamento || []; // Retorna o status de aberto calculado

    return checkIfOpen(horarios);
  } catch (error) {
    console.error("Erro ao buscar status do estabelecimento:", error);
    return false;
  }
};

export const storeService = {
  // 💡 CORREÇÃO CRÍTICA: Incluindo a função no objeto de exportação
  getLoggedEstablishmentStatus, // Buscar todos os estabelecimentos

  async getAllStores(): Promise<Estabelecimento[]> {
    try {
      const token = await getAuthToken();
      const response = await api.get<any[]>("/estabelecimentos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const estabelecimentos: Estabelecimento[] = response.data.map(
        (e: any) => {
          const horarios: HorarioUpdate[] = e.horario_funcionamento || [];

          const now = new Date();
          const currentDay = now.getDay(); // 0 = domingo, 1 = segunda, ...
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTimeInMinutes = currentHours * 60 + currentMinutes;

          const horarioHoje = horarios.find((h) => h.dia === currentDay);
          let aberto = false;

          if (horarioHoje && !horarioHoje.fechado) {
            try {
              const [hA, mA] = horarioHoje.horario_abertura
                .split(":")
                .map(Number);
              const [hF, mF] = horarioHoje.horario_fechamento
                .split(":")
                .map(Number);

              const openTime = hA * 60 + mA;
              const closeTime = hF * 60 + mF;

              if (openTime > closeTime) {
                // Caso o horário atravesse a meia-noite
                aberto =
                  currentTimeInMinutes >= openTime ||
                  currentTimeInMinutes <= closeTime;
              } else {
                aberto =
                  currentTimeInMinutes >= openTime &&
                  currentTimeInMinutes <= closeTime;
              }
            } catch (err) {
              console.warn("Erro ao calcular horário de funcionamento:", err);
            }
          }

          return {
            idestabelecimento: e.idestabelecimento,
            razao_social: e.razao_social,
            telefone_contato: e.telefone_contato,
            conta_bancaria: e.conta_bancaria,
            raio_cobertura: Number(e.raio_cobertura),
            valor_minimo_entrega: Number(e.valor_minimo_entrega),
            taxa_entrega: Number(e.taxa_entrega),
            logo_url: e.logo_url,
            distancia: "N/D",
            tempo_entrega: "N/D",
            aberto,
            endereco_estabelecimento: e.endereco_estabelecimento,
          };
        }
      );

      console.log(
        "🟢 Estabelecimentos com status de aberto:",
        estabelecimentos
      );
      return estabelecimentos;
    } catch (error) {
      console.error("Erro ao buscar estabelecimentos:", error);
      return [];
    }
  }, // Buscar estabelecimento por ID

  async getStoreById(id: number): Promise<Estabelecimento> {
    try {
      const token = await getAuthToken();
      const response = await api.get<Estabelecimento>(
        `/estabelecimentos/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar estabelecimento ${id}:`, error);
      throw error;
    }
  }, // Buscar últimos estabelecimentos (você pode adaptar conforme sua lógica)

  async getLastStores(): Promise<Estabelecimento[]> {
    try {
      const token = await getAuthToken();
      const response = await api.get<Estabelecimento[]>("/estabelecimentos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.slice(0, 4);
    } catch (error) {
      console.error("Erro ao buscar últimos estabelecimentos:", error);
      throw error;
    }
  }, // Buscar produtos do estabelecimento usando a rota do catálogo

  async getStoreProducts(storeId: number): Promise<Produto[]> {
    try {
      const token = await getAuthToken();
      console.log("🔑 Token:", token ? "Token presente" : "Token ausente");
      console.log("🏪 Store ID:", storeId); // CORREÇÃO: Mudando para singular

      const url = `/catalogo-produto/estabelecimento/${storeId}`;
      console.log("🌐 Fazendo requisição para:", url);

      console.log("📤 Enviando requisição...");

      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ REQUISIÇÃO BEM-SUCEDIDA!");
      console.log("📊 Response status:", response.status);
      console.log("📦 Response data:", response.data);
      console.log("📋 Response headers:", response.headers); // Verifica se a resposta é um array

      if (!Array.isArray(response.data)) {
        console.log("❌ Response.data não é um array:", typeof response.data);
        console.log("💡 Response.data value:", response.data);
        return [];
      }

      console.log(`🔄 Mapeando ${response.data.length} produtos...`); // Mapear os dados da API para o formato esperado no frontend

      const produtos = response.data.map((produto: any, index: number) => {
        console.log(`   📝 Mapeando produto ${index + 1}:`, produto.nome);
        return {
          idproduto: produto.idproduto?.toString() || "",
          idcatalogo_produto: produto.idcatalogo_produto?.toString() || "",
          nome: produto.nome || "Produto sem nome",
          descricao: produto.descricao || "",
          preco: produto.preco || 0,
          imagem_url: produto.imagem_url || null,
          classe_terapeutica: produto.classe_terapeutica || "Outros",
          favorito: produto.favorito || false,
          estoque: produto.estoque || 0,
          disponibilidade: produto.disponibilidade !== false,
        };
      });

      console.log(`🎉 ${produtos.length} produtos mapeados com sucesso!`);
      return produtos;
    } catch (error: any) {
      console.log("❌ CAPTURANDO ERRO NA REQUISIÇÃO...");
      console.error(
        `Erro ao buscar produtos do estabelecimento ${storeId}:`,
        error
      ); // Log detalhado do erro

      if (error.response) {
        console.log("📊 ERRO - Response received:");
        console.log("   Status:", error.response.status);
        console.log("   Data:", error.response.data);
        console.log("   Headers:", error.response.headers);
        console.log("   URL:", error.response.config?.url);
        console.log("   Method:", error.response.config?.method);
      } else if (error.request) {
        console.log("📊 ERRO - No response received:");
        console.log("   Request:", error.request);
        console.log(
          "   Este erro significa que a requisição foi feita mas não houve resposta"
        );
      } else {
        console.log("📊 ERRO - Setup error:");
        console.log("   Message:", error.message);
      }

      console.log("🔧 Configuração completa do erro:", error.config); // Lança o erro para ser capturado pela função chamadora

      throw error;
    }
  }, // Alternar favorito do produto no catálogo

  async toggleProductFavorite(
    idcatalogo_produto: string,
    isFavorite: boolean
  ): Promise<void> {
    try {
      await api.patch(`/catalogo-produto/${idcatalogo_produto}`, {
        favorito: isFavorite,
      });
    } catch (error) {
      console.error(
        `Erro ao alternar favorito do produto ${idcatalogo_produto}:`,
        error
      );
      throw error;
    }
  }, // Adicionar produto ao carrinho

  async addToCart(
    idcliente: number,
    idproduto: string,
    quantidade: number = 1
  ): Promise<void> {
    try {
      const carrinhoResponse = await api.get(`/carrinho/${idcliente}`);
      const idcarrinho = carrinhoResponse.data.idcarrinho;

      await api.post(`/carrinho/${idcarrinho}/item`, {
        idproduto: idproduto,
        quantidade: quantidade,
      });
    } catch (error) {
      console.error(
        `Erro ao adicionar produto ${idproduto} ao carrinho:`,
        error
      );
      throw error;
    }
  },

  async updateBusinessHours(
    establishmentId: number,
    scheduleUpdates: HorarioUpdate[]
  ): Promise<void> {
    try {
      const token = await getAuthToken();
      const estabelecimentoid = await getEstablishmentId(); // ATENÇÃO: Você precisará confirmar com seu backend qual é a rota exata. // Aqui estou usando uma rota PATCH no estabelecimento, enviando o array de updates. // Outra abordagem comum é ter um endpoint /horario_funcionamento/bulk
      const response = await api.patch(
        `/horarios/estabelecimentos/${estabelecimentoid}/horarios`,
        scheduleUpdates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Falha ao atualizar horários no servidor.");
      }
      console.log("Horários de funcionamento atualizados com sucesso.");
    } catch (error) {
      console.error(
        `Erro ao atualizar horários do estabelecimento ${establishmentId}:`,
        error
      ); // Re-lança o erro para ser tratado no Modal
      throw error;
    }
  },
};
