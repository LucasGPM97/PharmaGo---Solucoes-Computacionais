import EstabelecimentoService from "../../src/services/EstabelecimentoService";
import Estabelecimento from "../../src/models/Estabelecimento";
import HorarioFuncionamento from "../../src/models/HorarioFuncionamento";
import Catalogo from "../../src/models/Catalogo";
import EnderecoEstabelecimento from "../../src/models/EnderecoEstabelecimento";

jest.mock("../../src/models/Estabelecimento");
jest.mock("../../src/models/HorarioFuncionamento");
jest.mock("../../src/models/Catalogo");
jest.mock("../../src/models/EnderecoEstabelecimento");

const mockEstabelecimento = Estabelecimento as jest.MockedClass<
  typeof Estabelecimento
>;
const mockHorarioFuncionamento = HorarioFuncionamento as jest.MockedClass<
  typeof HorarioFuncionamento
>;
const mockCatalogo = Catalogo as jest.MockedClass<typeof Catalogo>;
const mockEnderecoEstabelecimento = EnderecoEstabelecimento as jest.MockedClass<
  typeof EnderecoEstabelecimento
>;

describe("EstabelecimentoService", () => {
  const mockEstabelecimentoData = {
    idestabelecimento: 1,
    cnpj: "12345678000100",
    email: "test@farmacia.com",
    razao_social: "Farmácia Teste LTDA",
    registro_anvisa: "123456",
    responsavel_tecnico: "Responsável Teste",
    telefone_contato: "11999999999",
    conta_bancaria: "12345-6",
    raio_cobertura: 10.5,
    valor_minimo_entrega: 15.0,
    taxa_entrega: 5.0,
    logo_url: "http://logo.com/logo.jpg",
    senha: "hashedpassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHorarioFuncionamentoData = {
    idhorario_funcionamento: 1,
    estabelecimento_idestabelecimento: 1,
    dia: 0,
    horario_abertura: "08:00:00",
    horario_fechamento: "18:00:00",
    fechado: false,
  };

  const mockCatalogoData = {
    idcatalogo: 1,
    estabelecimento_idestabelecimento: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (mockEstabelecimento.create as jest.Mock) = jest.fn();
    (mockEstabelecimento.findByPk as jest.Mock) = jest.fn();
    (mockEstabelecimento.findAll as jest.Mock) = jest.fn();
    (mockEstabelecimento.update as jest.Mock) = jest.fn();
    (mockEstabelecimento.destroy as jest.Mock) = jest.fn();
    (mockHorarioFuncionamento.bulkCreate as jest.Mock) = jest.fn();
    (mockCatalogo.create as jest.Mock) = jest.fn();
  });

  // -------------------------------------------------------------------
  // --- CREATE ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("createEstabelecimento", () => {
    it("deve criar um estabelecimento com sucesso e criar horários padrão e catálogo", async () => {
      const estabelecimentoData = {
        cnpj: "12345678000100",
        email: "test@farmacia.com",
        razao_social: "Farmácia Teste",
        registro_anvisa: "123456",
        responsavel_tecnico: "Responsável",
        telefone_contato: "11999999999",
        conta_bancaria: "12345-6",
        raio_cobertura: 10.0,
        valor_minimo_entrega: 15.0,
        taxa_entrega: 5.0,
        logo_url: "logo.jpg",
        senha: "password123",
      };

      (mockEstabelecimento.create as jest.Mock).mockResolvedValue({
        ...mockEstabelecimentoData,
        idestabelecimento: 1,
      });

      (mockHorarioFuncionamento.bulkCreate as jest.Mock).mockResolvedValue([
        mockHorarioFuncionamentoData,
      ]);
      (mockCatalogo.create as jest.Mock).mockResolvedValue(mockCatalogoData);

      const result = await EstabelecimentoService.createEstabelecimento(
        estabelecimentoData
      );

      expect(mockEstabelecimento.create).toHaveBeenCalledWith({
        cnpj: "12345678000100",
        email: "test@farmacia.com",
        razao_social: "Farmácia Teste",
        registro_anvisa: "123456",
        responsavel_tecnico: "Responsável",
        telefone_contato: "11999999999",
        conta_bancaria: "12345-6",
        raio_cobertura: 10.0,
        valor_minimo_entrega: 15.0,
        taxa_entrega: 5.0,
        caminho_imagem_logo: "logo.jpg",
        senha: "password123",
      });

      expect(mockHorarioFuncionamento.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            estabelecimento_idestabelecimento: 1,
            dia: expect.any(Number),
            horario_abertura: "08:00:00",
            horario_fechamento: "18:00:00",
            fechado: false,
          }),
        ])
      );
      expect(mockCatalogo.create).toHaveBeenCalledWith({
        idcatalogo: 1,
        estabelecimento_idestabelecimento: 1,
      });
      expect(result).toEqual(expect.objectContaining({ idestabelecimento: 1 }));
    });

    it("deve lançar erro se a criação do estabelecimento falhar", async () => {
      const estabelecimentoData = {
        cnpj: "12345678000100",
        email: "test@farmacia.com",
        razao_social: "Farmácia Teste",
        registro_anvisa: "123456",
        responsavel_tecnico: "Responsável",
        telefone_contato: "11999999999",
        conta_bancaria: "12345-6",
        raio_cobertura: 10.0,
        valor_minimo_entrega: 15.0,
        taxa_entrega: 5.0,
        logo_url: "logo.jpg",
        senha: "password123",
      };

      (mockEstabelecimento.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        EstabelecimentoService.createEstabelecimento(estabelecimentoData)
      ).rejects.toThrow("Database error");
    });
  });

  // -------------------------------------------------------------------
  // --- GET ESTABELECIMENTO BY ID
  // -------------------------------------------------------------------

  describe("getEstabelecimentoById", () => {
    it("deve retornar estabelecimento com horários e endereço quando encontrado", async () => {
      (mockEstabelecimento.findByPk as jest.Mock).mockResolvedValue(
        mockEstabelecimentoData
      );

      const result = await EstabelecimentoService.getEstabelecimentoById(1);

      expect(mockEstabelecimento.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: HorarioFuncionamento,
            as: "horario_funcionamento",
          },
          {
            model: EnderecoEstabelecimento,
            as: "endereco_estabelecimento",
          },
        ],
      });
      expect(result).toEqual(mockEstabelecimentoData);
    });

    it("deve retornar null quando estabelecimento não for encontrado", async () => {
      (mockEstabelecimento.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await EstabelecimentoService.getEstabelecimentoById(999);

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------
  // --- GET ALL ESTABELECIMENTOS
  // -------------------------------------------------------------------

  describe("getAllEstabelecimentos", () => {
    it("deve retornar lista de estabelecimentos com horários e endereços", async () => {
      const estabelecimentosList = [mockEstabelecimentoData];
      (mockEstabelecimento.findAll as jest.Mock).mockResolvedValue(
        estabelecimentosList
      );

      const result = await EstabelecimentoService.getAllEstabelecimentos();

      expect(mockEstabelecimento.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: HorarioFuncionamento,
            as: "horario_funcionamento",
          },
          {
            model: EnderecoEstabelecimento,
            as: "endereco_estabelecimento",
          },
        ],
      });
      expect(result).toEqual(estabelecimentosList);
    });

    it("deve retornar array vazio quando não houver estabelecimentos", async () => {
      (mockEstabelecimento.findAll as jest.Mock).mockResolvedValue([]);

      const result = await EstabelecimentoService.getAllEstabelecimentos();

      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("updateEstabelecimento", () => {
    it("deve atualizar estabelecimento com sucesso", async () => {
      const updateData = { razao_social: "Nova Razão Social" };
      const affectedRows = [mockEstabelecimentoData];

      (mockEstabelecimento.update as jest.Mock).mockResolvedValue([
        1,
        affectedRows,
      ]);

      const result = await EstabelecimentoService.updateEstabelecimento(
        1,
        updateData
      );

      expect(mockEstabelecimento.update).toHaveBeenCalledWith(updateData, {
        where: { idestabelecimento: 1 },
        returning: true,
      });
      expect(result).toEqual([1, affectedRows]);
    });

    it("deve retornar [0, []] quando nenhum estabelecimento for atualizado", async () => {
      const updateData = { razao_social: "Nova Razão Social" };

      (mockEstabelecimento.update as jest.Mock).mockResolvedValue([0, []]);

      const result = await EstabelecimentoService.updateEstabelecimento(
        999,
        updateData
      );

      expect(result).toEqual([0, []]);
    });
  });

  // -------------------------------------------------------------------
  // --- DELETE ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("deleteEstabelecimento", () => {
    it("deve deletar estabelecimento com sucesso", async () => {
      (mockEstabelecimento.destroy as jest.Mock).mockResolvedValue(1);

      const result = await EstabelecimentoService.deleteEstabelecimento(1);

      expect(mockEstabelecimento.destroy).toHaveBeenCalledWith({
        where: { idestabelecimento: 1 },
      });
      expect(result).toBe(1);
    });

    it("deve retornar 0 quando nenhum estabelecimento for deletado", async () => {
      (mockEstabelecimento.destroy as jest.Mock).mockResolvedValue(0);

      const result = await EstabelecimentoService.deleteEstabelecimento(999);

      expect(result).toBe(0);
    });
  });

  // -------------------------------------------------------------------
  // --- CREATE DEFAULT OPERATING HOURS
  // -------------------------------------------------------------------

  describe("createDefaultOperatingHours", () => {
    it("deve criar horários padrão para todos os dias da semana", async () => {
      (mockHorarioFuncionamento.bulkCreate as jest.Mock).mockResolvedValue([
        mockHorarioFuncionamentoData,
      ]);

      await EstabelecimentoService.createDefaultOperatingHours(1);

      expect(mockHorarioFuncionamento.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ dia: 0 }),
          expect.objectContaining({ dia: 1 }),
          expect.objectContaining({ dia: 2 }),
          expect.objectContaining({ dia: 3 }),
          expect.objectContaining({ dia: 4 }),
          expect.objectContaining({ dia: 5 }),
          expect.objectContaining({ dia: 6 }),
        ])
      );
    });

    it("deve lançar erro se a criação dos horários falhar", async () => {
      (mockHorarioFuncionamento.bulkCreate as jest.Mock).mockRejectedValue(
        new Error("Bulk create error")
      );

      await expect(
        EstabelecimentoService.createDefaultOperatingHours(1)
      ).rejects.toThrow(
        "Falha ao criar horários de funcionamento padrão: Bulk create error"
      );
    });
  });

  // -------------------------------------------------------------------
  // --- CREATE CATALOGO
  // -------------------------------------------------------------------

  describe("createCatalogo", () => {
    it("deve criar catálogo com sucesso", async () => {
      (mockCatalogo.create as jest.Mock).mockResolvedValue(mockCatalogoData);

      const result = await EstabelecimentoService.createCatalogo(1);

      expect(mockCatalogo.create).toHaveBeenCalledWith({
        idcatalogo: 1,
        estabelecimento_idestabelecimento: 1,
      });
      expect(result).toEqual(mockCatalogoData);
    });

    it("deve lançar erro se a criação do catálogo falhar", async () => {
      (mockCatalogo.create as jest.Mock).mockRejectedValue(
        new Error("Catalog creation error")
      );

      await expect(EstabelecimentoService.createCatalogo(1)).rejects.toThrow(
        "Erro ao criar catálogo para o estabelecimento"
      );
    });
  });
});
