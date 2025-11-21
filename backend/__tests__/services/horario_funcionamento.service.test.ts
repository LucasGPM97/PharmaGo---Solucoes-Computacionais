jest.mock("../../src/models/HorarioFuncionamento", () => {
  const mockModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockModel,
  };
});

jest.mock("../../src/config/database", () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
  },
}));

import HorarioFuncionamentoService from "../../src/services/HorarioFuncionamentoService";

const HorarioFuncionamento =
  require("../../src/models/HorarioFuncionamento").default;
const sequelize = require("../../src/config/database").default;

describe("HorarioFuncionamentoService", () => {
  const mockHorario = {
    idhorario_funcionamento: 1,
    estabelecimento_idestabelecimento: 1,
    dia: 1,
    horario_abertura: "08:00:00",
    horario_fechamento: "18:00:00",
    fechado: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createHorario", () => {
    it("deve criar um horário com sucesso", async () => {
      const horarioData = {
        estabelecimento_idestabelecimento: 1,
        dia: 1,
        horario_abertura: "08:00:00",
        horario_fechamento: "18:00:00",
        fechado: false,
      };

      HorarioFuncionamento.create.mockResolvedValue(mockHorario);

      const result = await HorarioFuncionamentoService.createHorario(
        horarioData
      );

      expect(HorarioFuncionamento.create).toHaveBeenCalledWith(horarioData);
      expect(result).toEqual(mockHorario);
    });
  });

  describe("getHorariosByEstabelecimento", () => {
    it("deve retornar horários de um estabelecimento", async () => {
      const mockHorarios = [mockHorario];
      HorarioFuncionamento.findAll.mockResolvedValue(mockHorarios);

      const result =
        await HorarioFuncionamentoService.getHorariosByEstabelecimento(1);

      expect(HorarioFuncionamento.findAll).toHaveBeenCalledWith({
        where: { estabelecimento_idestabelecimento: 1 },
        order: [["dia", "ASC"]],
      });
      expect(result).toEqual(mockHorarios);
    });

    it("deve retornar array vazio para estabelecimento sem horários", async () => {
      HorarioFuncionamento.findAll.mockResolvedValue([]);

      const result =
        await HorarioFuncionamentoService.getHorariosByEstabelecimento(999);

      expect(result).toEqual([]);
    });
  });

  describe("updateHorario", () => {
    it("deve atualizar horário com sucesso", async () => {
      const updateData = { horario_abertura: "09:00:00" };
      HorarioFuncionamento.update.mockResolvedValue([1, [mockHorario]]);

      const result = await HorarioFuncionamentoService.updateHorario(
        1,
        updateData
      );

      expect(HorarioFuncionamento.update).toHaveBeenCalledWith(updateData, {
        where: { idhorario_funcionamento: 1 },
        returning: true,
      });
      expect(result[0]).toBe(1);
    });
  });

  describe("deleteHorario", () => {
    it("deve deletar horário com sucesso", async () => {
      HorarioFuncionamento.destroy.mockResolvedValue(1);

      const result = await HorarioFuncionamentoService.deleteHorario(1);

      expect(HorarioFuncionamento.destroy).toHaveBeenCalledWith({
        where: { idhorario_funcionamento: 1 },
      });
      expect(result).toBe(1);
    });
  });

  describe("updateBulk", () => {
    it("deve atualizar horários em lote com sucesso", async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      sequelize.transaction.mockImplementation((callback: any) =>
        callback(mockTransaction)
      );

      const existingHorarios = [mockHorario];
      HorarioFuncionamento.findAll.mockResolvedValue(existingHorarios);
      HorarioFuncionamento.update.mockResolvedValue([1]);
      HorarioFuncionamento.create.mockResolvedValue({});

      const updates = [
        {
          idhorario_funcionamento: 1,
          dia: 1,
          fechado: false,
          horario_abertura: "09:00:00",
          horario_fechamento: "17:00:00",
        },
      ];

      await HorarioFuncionamentoService.updateBulk(1, updates);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(HorarioFuncionamento.findAll).toHaveBeenCalled();
    });
  });
});
