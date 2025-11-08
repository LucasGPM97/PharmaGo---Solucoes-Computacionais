import ReceitaMedica from "../models/ReceitaMedica";
import { Transaction } from "sequelize"; // Adicionando import para tipagem se necessário

// Tipo de dados mais seguro e completo para a criação
interface ReceitaMedicaCreationData {
  pedido_idpedido: number;
  cliente_idcliente: number; // O ID do usuário que faz o upload (cliente)
  caminho_documento: string; // O URL/path de upload
  nome_arquivo: string; // O nome original do arquivo
  status_receita?: string; // Opcional, default 'pendente'
}

class ReceitaMedicaService {
  // 🚨 Função atualizada para incluir cliente_idcliente e nome_arquivo e usar tipos fortes
  public async createReceitaMedica(
    data: ReceitaMedicaCreationData,
    t?: Transaction
  ): Promise<ReceitaMedica> {
    try {
      const {
        pedido_idpedido,
        caminho_documento,
        cliente_idcliente,
        nome_arquivo,
        status_receita,
      } = data;

      console.log(
        `📝 Registrando receita para Pedido ${pedido_idpedido} (Cliente ${cliente_idcliente})`
      );

      // Usa status_receita se fornecido, caso contrário, 'pendente'
      const status = status_receita || "pendente";

      const receitaMedica = await ReceitaMedica.create(
        {
          pedido_idpedido,
          cliente_idcliente, // 🎯 NOVO CAMPO
          caminho_documento,
          nome_arquivo, // 🎯 NOVO CAMPO
          status_receita: status,
        },
        { transaction: t }
      );

      return receitaMedica;
    } catch (error) {
      console.error("❌ Erro em createReceitaMedica Service:", error);
      // Lança um erro customizado para o Controller/Route
      throw new Error(
        "Falha ao registrar a receita médica. Verifique os dados fornecidos."
      );
    }
  }

  // ... (Os demais métodos findById, findByPedidoId, update, delete permanecem iguais)

  public async getReceitaMedicaById(
    idreceita_medica: string
  ): Promise<ReceitaMedica | null> {
    const receitaMedica = await ReceitaMedica.findByPk(idreceita_medica);
    return receitaMedica;
  }

  public async getReceitaMedicaByPedidoId(
    pedido_idpedido: number
  ): Promise<ReceitaMedica | null> {
    const receitaMedica = await ReceitaMedica.findOne({
      where: { pedido_idpedido },
    });
    return receitaMedica;
  }

  public async updateReceitaMedica(
    idreceita_medica: number,
    data: any
  ): Promise<[number, ReceitaMedica[]]> {
    const [affectedCount, affectedRows] = await ReceitaMedica.update(data, {
      where: { idreceita_medica },
      returning: true,
    });
    return [affectedCount, affectedRows];
  }

  public async deleteReceitaMedica(idreceita_medica: number): Promise<number> {
    const deletedRows = await ReceitaMedica.destroy({
      where: { idreceita_medica },
    });
    return deletedRows;
  }
}

export default new ReceitaMedicaService();
