import sequelize from "../config/database";
import { HorarioUpdate } from "../controllers/HorarioFuncionamentoController";
import HorarioFuncionamento from "../models/HorarioFuncionamento";

class HorarioFuncionamentoService {
  public async createHorario(data: any): Promise<HorarioFuncionamento> {
    const horario = await HorarioFuncionamento.create(data);
    return horario;
  }

  public async getHorariosByEstabelecimento(
    estabelecimentoId: number
  ): Promise<HorarioFuncionamento[]> {
    const horarios = await HorarioFuncionamento.findAll({
      where: { estabelecimento_idestabelecimento: estabelecimentoId },
      order: [["dia", "ASC"]],
    });
    return horarios;
  }

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
    await sequelize.transaction(async (t) => {
      const existingHorarios = await HorarioFuncionamento.findAll({
        where: {
          estabelecimento_idestabelecimento: idestabelecimento,
        },
        transaction: t,
      });

      const existingMap = new Map(existingHorarios.map((h) => [h.dia, h]));

      for (const update of updates) {
        const existingDay = existingMap.get(update.dia);

        const dataToSave = {
          estabelecimento_idestabelecimento: idestabelecimento,
          dia: update.dia,
          fechado: update.fechado,
          horario_abertura: update.horario_abertura,
          horario_fechamento: update.horario_fechamento,
        };

        if (existingDay && existingDay.idhorario_funcionamento) {
          await HorarioFuncionamento.update(dataToSave, {
            where: {
              idhorario_funcionamento: existingDay.idhorario_funcionamento,
            },
            transaction: t,
          });
        } else if (!update.fechado) {
          await HorarioFuncionamento.create(dataToSave, { transaction: t });
        }
      }
    });
  }

  public async deleteHorario(idhorario_funcionamento: number): Promise<number> {
    const deletedRows = await HorarioFuncionamento.destroy({
      where: { idhorario_funcionamento },
    });
    return deletedRows;
  }
}

export default new HorarioFuncionamentoService();
