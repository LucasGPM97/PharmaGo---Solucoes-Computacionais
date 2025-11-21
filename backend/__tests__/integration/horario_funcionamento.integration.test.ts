import request from "supertest";
import { Application } from "express";
import app from "../../src/app";
import HorarioFuncionamentoService from "../../src/services/HorarioFuncionamentoService";

jest.mock("../../src/services/HorarioFuncionamentoService");

jest.mock("../../src/middlewares/authMiddleware", () => {
  return (req: any, res: any, next: any) => {
    req.user = { id: 1, tipo: "estabelecimento" };
    next();
  };
});

const mockHorarioFuncionamentoService =
  HorarioFuncionamentoService as jest.Mocked<
    typeof HorarioFuncionamentoService
  >;

describe("HorarioFuncionamentoController - Testes de Integração", () => {
  const mockDate = new Date().toISOString();

  const mockHorario = {
    idhorario_funcionamento: 1,
    estabelecimento_idestabelecimento: 1,
    dia: 1,
    horario_abertura: "08:00:00",
    horario_fechamento: "18:00:00",
    fechado: false,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockHorarioUpdate = {
    idhorario_funcionamento: 1,
    fechado: false,
    horario_abertura: "09:00:00",
    horario_fechamento: "17:00:00",
    dia: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------
  // --- GET HORARIOS BY ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("GET /horarios/estabelecimentos/:idestabelecimento/horarios", () => {
    it("deve retornar 200 e lista de horários do estabelecimento", async () => {
      const horariosList = [
        mockHorario,
        { ...mockHorario, idhorario_funcionamento: 2, dia: 2 },
      ];

      mockHorarioFuncionamentoService.getHorariosByEstabelecimento.mockResolvedValue(
        horariosList as any
      );

      const response = await request(app as Application).get(
        "/horarios/estabelecimentos/1/horarios"
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(horariosList);
      expect(
        mockHorarioFuncionamentoService.getHorariosByEstabelecimento
      ).toHaveBeenCalledWith(1);
    });

    it("deve retornar 400 quando ID do estabelecimento for inválido", async () => {
      const response = await request(app as Application).get(
        "/horarios/estabelecimentos/abc/horarios"
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("ID do estabelecimento inválido");
    });

    it("deve retornar 500 em caso de erro interno", async () => {
      mockHorarioFuncionamentoService.getHorariosByEstabelecimento.mockRejectedValue(
        new Error("Erro de banco")
      );

      const response = await request(app as Application).get(
        "/horarios/estabelecimentos/1/horarios"
      );

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Erro interno do servidor");
    });
  });

  // -------------------------------------------------------------------
  // --- CREATE HORARIO
  // -------------------------------------------------------------------

  describe("POST /horarios", () => {
    it("deve retornar 201 e criar um novo horário", async () => {
      const newHorarioData = {
        estabelecimento_idestabelecimento: 1,
        dia: 1,
        horario_abertura: "08:00:00",
        horario_fechamento: "18:00:00",
        fechado: false,
      };

      mockHorarioFuncionamentoService.createHorario.mockResolvedValue(
        mockHorario as any
      );

      const response = await request(app as Application)
        .post("/horarios")
        .send(newHorarioData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockHorario);
      expect(
        mockHorarioFuncionamentoService.createHorario
      ).toHaveBeenCalledWith(newHorarioData);
    });

    it("deve retornar 400 em caso de erro na criação", async () => {
      const invalidData = {
        estabelecimento_idestabelecimento: 1,
      };

      mockHorarioFuncionamentoService.createHorario.mockRejectedValue(
        new Error("Dados inválidos")
      );

      const response = await request(app as Application)
        .post("/horarios")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Dados inválidos");
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE HORARIO
  // -------------------------------------------------------------------

  describe("PUT /horarios/:idhorario", () => {
    it("deve retornar 204 ao atualizar horário com sucesso", async () => {
      const updateData = {
        horario_abertura: "09:00:00",
        horario_fechamento: "17:00:00",
      };

      mockHorarioFuncionamentoService.updateHorario.mockResolvedValue([
        1,
        [mockHorario] as any,
      ]);

      const response = await request(app as Application)
        .put("/horarios/1")
        .send(updateData);

      expect(response.status).toBe(204);
      expect(
        mockHorarioFuncionamentoService.updateHorario
      ).toHaveBeenCalledWith(1, updateData);
    });

    it("deve retornar 400 quando ID do horário for inválido", async () => {
      const response = await request(app as Application)
        .put("/horarios/abc")
        .send({ horario_abertura: "09:00:00" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "ID do horário de funcionamento inválido"
      );
    });

    it("deve retornar 404 quando horário não for encontrado", async () => {
      mockHorarioFuncionamentoService.updateHorario.mockResolvedValue([0, []]);

      const response = await request(app as Application)
        .put("/horarios/999")
        .send({ horario_abertura: "09:00:00" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Horário não encontrado");
    });

    it("deve retornar 400 em caso de erro na atualização", async () => {
      mockHorarioFuncionamentoService.updateHorario.mockRejectedValue(
        new Error("Erro de atualização")
      );

      const response = await request(app as Application)
        .put("/horarios/1")
        .send({ horario_abertura: "09:00:00" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de atualização");
    });
  });

  // -------------------------------------------------------------------
  // --- DELETE HORARIO
  // -------------------------------------------------------------------

  describe("DELETE /horarios/:idhorario", () => {
    it("deve retornar 204 ao deletar horário com sucesso", async () => {
      mockHorarioFuncionamentoService.deleteHorario.mockResolvedValue(1);

      const response = await request(app as Application).delete("/horarios/1");

      expect(response.status).toBe(204);
      expect(
        mockHorarioFuncionamentoService.deleteHorario
      ).toHaveBeenCalledWith(1);
    });

    it("deve retornar 404 quando horário não for encontrado", async () => {
      mockHorarioFuncionamentoService.deleteHorario.mockResolvedValue(0);

      const response = await request(app as Application).delete(
        "/horarios/999"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Horário não encontrado");
    });

    it("deve retornar 400 em caso de erro na deleção", async () => {
      mockHorarioFuncionamentoService.deleteHorario.mockRejectedValue(
        new Error("Erro de deleção")
      );

      const response = await request(app as Application).delete("/horarios/1");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de deleção");
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE BULK BY ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("PATCH /horarios/estabelecimentos/:idestabelecimento/horarios", () => {
    it("deve retornar 200 ao atualizar horários em lote com sucesso", async () => {
      const bulkUpdates = [mockHorarioUpdate];

      mockHorarioFuncionamentoService.updateBulk.mockResolvedValue(undefined);

      const response = await request(app as Application)
        .patch("/horarios/estabelecimentos/1/horarios")
        .send(bulkUpdates);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Horários atualizados com sucesso.");
      expect(mockHorarioFuncionamentoService.updateBulk).toHaveBeenCalledWith(
        1,
        bulkUpdates
      );
    });

    it("deve retornar 400 quando ID do estabelecimento for inválido", async () => {
      const response = await request(app as Application)
        .patch("/horarios/estabelecimentos/abc/horarios")
        .send([]);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "ID do estabelecimento inválido ou dados ausentes."
      );
    });

    it("deve retornar 400 quando dados não forem array", async () => {
      const response = await request(app as Application)
        .patch("/horarios/estabelecimentos/1/horarios")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "ID do estabelecimento inválido ou dados ausentes."
      );
    });

    it("deve retornar 400 em caso de erro de validação", async () => {
      const error = new Error("Erro de validação");
      error.name = "SequelizeValidationError";

      mockHorarioFuncionamentoService.updateBulk.mockRejectedValue(error);

      const response = await request(app as Application)
        .patch("/horarios/estabelecimentos/1/horarios")
        .send([mockHorarioUpdate]);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Falha ao salvar horários.");
    });

    it("deve retornar 500 em caso de erro interno", async () => {
      mockHorarioFuncionamentoService.updateBulk.mockRejectedValue(
        new Error("Erro de banco")
      );

      const response = await request(app as Application)
        .patch("/horarios/estabelecimentos/1/horarios")
        .send([mockHorarioUpdate]);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Falha ao salvar horários.");
    });
  });
});
