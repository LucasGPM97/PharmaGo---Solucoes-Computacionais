import EnderecoEstabelecimentoService from "../../src/services/EnderecoEstabelecimentoService";
import EnderecoEstabelecimento from "../../src/models/EnderecoEstabelecimento";

jest.mock("../../src/models/EnderecoEstabelecimento");

const mockEnderecoEstabelecimento = EnderecoEstabelecimento as jest.MockedClass<
  typeof EnderecoEstabelecimento
>;

describe("EnderecoEstabelecimentoService", () => {
  const mockEnderecoData = {
    idendereco_estabelecimento: 1,
    estabelecimento_idestabelecimento: 1,
    uf: "SP",
    logradouro: "Av. Paulista",
    numero: "1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "São Paulo",
    cep: "01310-100",
    latitude: "-23.563099",
    longitude: "-46.654279",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateData = {
    estabelecimento_idestabelecimento: 1,
    uf: "SP",
    logradouro: "Av. Paulista",
    numero: "1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "São Paulo",
    cep: "01310-100",
    latitude: "-23.563099",
    longitude: "-46.654279",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (mockEnderecoEstabelecimento.create as jest.Mock) = jest.fn();
    (mockEnderecoEstabelecimento.findByPk as jest.Mock) = jest.fn();
    (mockEnderecoEstabelecimento.findAll as jest.Mock) = jest.fn();
    (mockEnderecoEstabelecimento.update as jest.Mock) = jest.fn();
    (mockEnderecoEstabelecimento.destroy as jest.Mock) = jest.fn();
  });

  // -------------------------------------------------------------------
  // --- CREATE ENDERECO
  // -------------------------------------------------------------------

  describe("createEndereco", () => {
    it("deve criar um novo endereço de estabelecimento com sucesso", async () => {
      (mockEnderecoEstabelecimento.create as jest.Mock).mockResolvedValue(
        mockEnderecoData
      );

      const result = await EnderecoEstabelecimentoService.createEndereco(
        mockCreateData
      );

      expect(mockEnderecoEstabelecimento.create).toHaveBeenCalledWith({
        estabelecimento_idestabelecimento: 1,
        uf: "SP",
        logradouro: "Av. Paulista",
        numero: "1000",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "São Paulo",
        cep: "01310-100",
        latitude: "-23.563099",
        longitude: "-46.654279",
      });
      expect(result).toEqual(mockEnderecoData);
    });

    it("deve lançar erro ao falhar na criação", async () => {
      const errorMessage = "Erro de validação";
      (mockEnderecoEstabelecimento.create as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(
        EnderecoEstabelecimentoService.createEndereco(mockCreateData)
      ).rejects.toThrow(errorMessage);
    });
  });

  // -------------------------------------------------------------------
  // --- GET ENDERECO BY ID
  // -------------------------------------------------------------------

  describe("getEnderecoById", () => {
    it("deve retornar endereço quando encontrado", async () => {
      (mockEnderecoEstabelecimento.findByPk as jest.Mock).mockResolvedValue(
        mockEnderecoData
      );

      const result = await EnderecoEstabelecimentoService.getEnderecoById(1);

      expect(mockEnderecoEstabelecimento.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEnderecoData);
    });

    it("deve retornar null quando endereço não for encontrado", async () => {
      (mockEnderecoEstabelecimento.findByPk as jest.Mock).mockResolvedValue(
        null
      );

      const result = await EnderecoEstabelecimentoService.getEnderecoById(999);

      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------
  // --- GET ALL ENDERECOS BY ESTABELECIMENTO
  // -------------------------------------------------------------------

  describe("getAllEnderecosByEstabelecimento", () => {
    it("deve retornar lista de endereços do estabelecimento", async () => {
      const mockEnderecos = [mockEnderecoData];
      (mockEnderecoEstabelecimento.findAll as jest.Mock).mockResolvedValue(
        mockEnderecos
      );

      const result =
        await EnderecoEstabelecimentoService.getAllEnderecosByEstabelecimento(
          1
        );

      expect(mockEnderecoEstabelecimento.findAll).toHaveBeenCalledWith({
        where: { estabelecimento_idestabelecimento: 1 },
      });
      expect(result).toEqual(mockEnderecos);
    });

    it("deve retornar array vazio quando estabelecimento não tiver endereços", async () => {
      (mockEnderecoEstabelecimento.findAll as jest.Mock).mockResolvedValue([]);

      const result =
        await EnderecoEstabelecimentoService.getAllEnderecosByEstabelecimento(
          999
        );

      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE ENDERECO
  // -------------------------------------------------------------------

  describe("updateEndereco", () => {
    const updateData = {
      logradouro: "Av. Paulista Atualizada",
      numero: "2000",
    };

    it("deve atualizar endereço com sucesso", async () => {
      const mockUpdatedEndereco = {
        ...mockEnderecoData,
        ...updateData,
      };

      (mockEnderecoEstabelecimento.update as jest.Mock).mockResolvedValue([
        1,
        [mockUpdatedEndereco],
      ]);

      const result = await EnderecoEstabelecimentoService.updateEndereco(
        1,
        updateData
      );

      expect(mockEnderecoEstabelecimento.update).toHaveBeenCalledWith(
        updateData,
        {
          where: { idendereco_estabelecimento: 1 },
          returning: true,
        }
      );
      expect(result).toEqual([1, [mockUpdatedEndereco]]);
    });

    it("deve retornar [0, []] quando endereço não for encontrado", async () => {
      (mockEnderecoEstabelecimento.update as jest.Mock).mockResolvedValue([
        0,
        [],
      ]);

      const result = await EnderecoEstabelecimentoService.updateEndereco(
        999,
        updateData
      );

      expect(result).toEqual([0, []]);
    });
  });

  // -------------------------------------------------------------------
  // --- DELETE ENDERECO
  // -------------------------------------------------------------------

  describe("deleteEndereco", () => {
    it("deve deletar endereço com sucesso", async () => {
      (mockEnderecoEstabelecimento.destroy as jest.Mock).mockResolvedValue(1);

      const result = await EnderecoEstabelecimentoService.deleteEndereco(1);

      expect(mockEnderecoEstabelecimento.destroy).toHaveBeenCalledWith({
        where: { idendereco_estabelecimento: 1 },
      });
      expect(result).toBe(1);
    });

    it("deve retornar 0 quando endereço não for encontrado", async () => {
      (mockEnderecoEstabelecimento.destroy as jest.Mock).mockResolvedValue(0);

      const result = await EnderecoEstabelecimentoService.deleteEndereco(999);

      expect(result).toBe(0);
    });
  });
});
