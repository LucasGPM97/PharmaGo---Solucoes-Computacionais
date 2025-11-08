import ReceitaMedica from "../models/ReceitaMedica";
import { Transaction } from "sequelize"; 

interface ReceitaMedicaCreationData {
  pedido_idpedido: number;
  cliente_idcliente: number; 
  caminho_documento: string; 
  nome_arquivo: string; 
  status_receita?: string;
}

class ReceitaMedicaService {
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

      const status = status_receita || "pendente";

      const receitaMedica = await ReceitaMedica.create(
        {
          pedido_idpedido,
          cliente_idcliente,
          caminho_documento,
          nome_arquivo, 
          status_receita: status,
        },
        { transaction: t }
      );

      return receitaMedica;
    } catch (error) {
      console.error("❌ Erro em createReceitaMedica Service:", error);
      throw new Error(
        "Falha ao registrar a receita médica. Verifique os dados fornecidos."
      );
    }
  }


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
