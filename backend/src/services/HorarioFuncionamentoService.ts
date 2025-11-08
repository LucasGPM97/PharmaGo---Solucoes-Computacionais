import sequelize from "../config/database";
import { HorarioUpdate } from "../controllers/HorarioFuncionamentoController";
import HorarioFuncionamento from "../models/HorarioFuncionamento";

class HorarioFuncionamentoService {
  /**
   * Cria um novo registro de horário de funcionamento (útil para adicionar múltiplos horários no mesmo dia).
   */
  public async createHorario(data: any): Promise<HorarioFuncionamento> {
    const horario = await HorarioFuncionamento.create(data);
    return horario;
  }

  /**
   * Recupera todos os horários de funcionamento para um estabelecimento específico,
   * ordenados por dia da semana.
   * @param estabelecimentoId O ID do estabelecimento.
   */
  public async getHorariosByEstabelecimento(
    estabelecimentoId: number
  ): Promise<HorarioFuncionamento[]> {
    const horarios = await HorarioFuncionamento.findAll({
      where: { estabelecimento_idestabelecimento: estabelecimentoId },
      order: [["dia", "ASC"]], // Ordena do Domingo (0) ao Sábado (6)
    });
    return horarios;
  }

  /**
   * Atualiza um registro de horário de funcionamento existente.
   * @param idhorario_funcionamento O ID do registro de horário a ser atualizado.
   * @param data Os campos a serem atualizados.
   */
  public async updateHorario(
    idhorario_funcionamento: number,
    data: any
  ): Promise<[number, HorarioFuncionamento[]]> {
    const [affectedCount, affectedRows] = await HorarioFuncionamento.update(
      data,
      {
        where: { idhorario_funcionamento },
        returning: true,
      }
    );
    return [affectedCount, affectedRows];
  }

  public async updateBulk(
    idestabelecimento: number,
    updates: HorarioUpdate[]
  ): Promise<void> {
    // Envolve a operação em uma transação para garantir que todos os updates
    // sejam bem-sucedidos ou que nenhum seja aplicado.
    await sequelize.transaction(async (t) => {
      const existingHorarios = await HorarioFuncionamento.findAll({
        where: {
          estabelecimento_idestabelecimento: idestabelecimento,
        },
        transaction: t,
      });

      // Cria um mapa para fácil acesso (dia do backend -> objeto)
      const existingMap = new Map(existingHorarios.map((h) => [h.dia, h]));

      for (const update of updates) {
        const existingDay = existingMap.get(update.dia);

        // Dados a serem salvos
        const dataToSave = {
          estabelecimento_idestabelecimento: idestabelecimento,
          dia: update.dia,
          fechado: update.fechado,
          horario_abertura: update.horario_abertura,
          horario_fechamento: update.horario_fechamento,
        };

        if (existingDay && existingDay.idhorario_funcionamento) {
          // 1. REGISTRO EXISTENTE (UPDATE)
          // Usamos o ID existente para atualizar
          await HorarioFuncionamento.update(dataToSave, {
            where: {
              idhorario_funcionamento: existingDay.idhorario_funcionamento,
            },
            transaction: t,
          });
        } else if (!update.fechado) {
          // 2. NOVO REGISTRO (CREATE)
          // Criamos apenas se o dia não estiver marcado como 'fechado'
          await HorarioFuncionamento.create(dataToSave, { transaction: t });
        }

        // Note: Não precisamos de lógica complexa para DELETE aqui.
        // Se um dia existente for marcado como 'fechado', o update resolve.
        // Se você precisar deletar um registro quando o dia for fechado, a lógica seria mais complexa.
      }

      // --- Lógica de DELETE (Se necessário) ---
      // Se o seu frontend não envia o dia (por exemplo, domingo) e ele existe no DB,
      // você pode querer deletá-lo.
      // Para simplificar, vamos assumir que o frontend envia os 7 dias (0-6).
      // Se um dia estiver no DB, mas não no array 'updates', ele será ignorado.

      // --- Lógica para Deletar Horários que se tornaram 'Fechado' ---
      // Se você quiser remover horários do DB quando eles estiverem 'fechado' na atualização:
      // Por exemplo: Se o frontend enviou 'fechado: true' para um dia, o `update` define fechado=true.
      // Se você quiser deletar esses registros (em vez de mantê-los como fechado: true), use:
      /*
            await HorarioFuncionamento.destroy({
                where: { 
                    estabelecimento_idestabelecimento: idestabelecimento,
                    fechado: true // Deleta todos que foram atualizados para fechado
                },
                transaction: t
            });
            */
      // Mantenha o `update` como está, pois é mais seguro.
    });

    // A transação garante que, se houver falha, nada é salvo.
  }

  /**
   * Exclui um registro de horário de funcionamento específico.
   * @param idhorario_funcionamento O ID do registro a ser excluído.
   */
  public async deleteHorario(idhorario_funcionamento: number): Promise<number> {
    const deletedRows = await HorarioFuncionamento.destroy({
      where: { idhorario_funcionamento },
    });
    return deletedRows;
  }
}

export default new HorarioFuncionamentoService();
