import { Request, Response } from "express";
import HorarioFuncionamentoService from "../services/HorarioFuncionamentoService";

export interface HorarioUpdate {
  idhorario_funcionamento: number | undefined;
  fechado: boolean;
  horario_abertura: string;
  horario_fechamento: string;
  dia: number;
}

class HorarioFuncionamentoController {
  /**
   * GET /api/estabelecimentos/:idestabelecimento/horarios
   * Busca todos os horários de funcionamento para um estabelecimento.
   */
  public async findAllByEstabelecimento(
    req: Request,
    res: Response
  ): Promise<Response> {
    const estabelecimentoId = Number(req.params.idestabelecimento);

    if (!estabelecimentoId || isNaN(estabelecimentoId)) {
      return res
        .status(400)
        .json({ message: "ID do estabelecimento inválido" });
    }

    try {
      const horarios =
        await HorarioFuncionamentoService.getHorariosByEstabelecimento(
          estabelecimentoId
        );
      return res.status(200).json(horarios);
    } catch (error: any) {
      console.error("Erro no findAllByEstabelecimento:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  /**
   * POST /api/horarios
   * Cria um novo registro de horário.
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const horario = await HorarioFuncionamentoService.createHorario(req.body);
      return res.status(201).json(horario);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * PUT /api/horarios/:idhorario
   * Atualiza um registro de horário específico.
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const idhorario = Number(req.params.idhorario);
      if (!idhorario || isNaN(idhorario)) {
        return res
          .status(400)
          .json({ message: "ID do horário de funcionamento inválido" });
      }

      const [affectedCount] = await HorarioFuncionamentoService.updateHorario(
        idhorario,
        req.body
      );
      if (affectedCount === 0) {
        return res.status(404).json({ message: "Horário não encontrado" });
      }

      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * DELETE /api/horarios/:idhorario
   * Deleta um registro de horário específico.
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const deletedRows = await HorarioFuncionamentoService.deleteHorario(
        Number(req.params.idhorario)
      );
      if (deletedRows === 0) {
        return res.status(404).json({ message: "Horário não encontrado" });
      }
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  /**
   * Atualiza o array completo de horários de funcionamento de um estabelecimento.
   */
  public async updateBulkByEstabelecimento(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const idestabelecimento = parseInt(req.params.idestabelecimento, 10);
      const updates: HorarioUpdate[] = req.body; // Espera um array de objetos de horário

      if (isNaN(idestabelecimento) || !Array.isArray(updates)) {
        return res
          .status(400)
          .json({ error: "ID do estabelecimento inválido ou dados ausentes." });
      }

      console.log(
        `Recebendo ${updates.length} horários para o Estabelecimento ID: ${idestabelecimento}`
      );

      // Chama o Service para processar a atualização em massa
      await HorarioFuncionamentoService.updateBulk(idestabelecimento, updates);

      return res
        .status(200)
        .json({ message: "Horários atualizados com sucesso." });
    } catch (error: any) {
      console.error("Erro no Controller ao atualizar horários:", error);
      // Se for erro de validação do Sequelize, pode ser 400, senão 500
      const status = error.name === "SequelizeValidationError" ? 400 : 500;
      return res.status(status).json({
        error: "Falha ao salvar horários.",
        details: error.message,
      });
    }
  }
}

export default new HorarioFuncionamentoController();
