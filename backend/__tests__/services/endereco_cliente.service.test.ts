import EnderecoClienteService from "../../src/services/EnderecoClienteService";
import EnderecoCliente from "../../src/models/EnderecoCliente";

jest.mock("../../src/models/EnderecoCliente");

const mockEnderecoCliente = EnderecoCliente as jest.MockedClass<
  typeof EnderecoCliente
>;

describe("EnderecoClienteService", () => {
  const mockEnderecoData = {
    idendereco_cliente: 1,
    cliente_idcliente: 1,
    uf: "SP",
    nome_endereco: "Casa",
    logradouro: "Rua das Flores",
    numero: "123",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "São Paulo",
    cep: "01234-567",
    latitude: "-23.550520",
    longitude: "-46.633308",
    ativo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateData = {
    cliente_idcliente: 1,
    uf: "SP",
    nome_endereco: "Casa",
    logradouro: "Rua das Flores",
    numero: "123",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "São Paulo",
    cep: "01234-567",
    latitude: "-23.550520",
    longitude: "-46.633308",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar mocks padrão
    (mockEnderecoCliente.create as jest.Mock) = jest.fn();
    (mockEnderecoCliente.findByPk as jest.Mock) = jest.fn();
    (mockEnderecoCliente.findAll as jest.Mock) = jest.fn();
    (mockEnderecoCliente.update as jest.Mock) = jest.fn();
  });

  // -------------------------------------------------------------------
  // --- CREATE ENDERECO
  // -------------------------------------------------------------------

  describe("createEndereco", () => {
    it("deve criar um novo endereço com sucesso", async () => {
      (mockEnderecoCliente.create as jest.Mock).mockResolvedValue(
        mockEnderecoData
      );

      const result = await EnderecoClienteService.createEndereco(
        mockCreateData
      );

      expect(mockEnderecoCliente.create).toHaveBeenCalledWith({
        cliente_idcliente: 1,
        uf: "SP",
        nome_endereco: "Casa",
        logradouro: "Rua das Flores",
        numero: "123",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "São Paulo",
        cep: "01234-567",
        latitude: "-23.550520",
        longitude: "-46.633308",
        complemento: null,
      });
      expect(result).toEqual(mockEnderecoData);
    });

    it("deve criar endereço com valores padrão quando latitude/longitude não fornecidos", async () => {
      const dataSemCoordenadas = {
        ...mockCreateData,
        latitude: undefined,
        longitude: undefined,
      };

      (mockEnderecoCliente.create as jest.Mock).mockResolvedValue({
        ...mockEnderecoData,
        latitude: "0.0",
        longitude: "0.0",
      });

      const result = await EnderecoClienteService.createEndereco(
        dataSemCoordenadas
      );

      expect(mockEnderecoCliente.create).toHaveBeenCalledWith({
        ...mockCreateData,
        latitude: "0.0",
        longitude: "0.0",
        complemento: null,
      });
      expect(result.latitude).toBe("0.0");
      expect(result.longitude).toBe("0.0");
    });

    it("deve lançar erro ao falhar na criação", async () => {
      const errorMessage = "Erro de validação";
      (mockEnderecoCliente.create as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(
        EnderecoClienteService.createEndereco(mockCreateData)
      ).rejects.toThrow(`Erro ao criar endereço: ${errorMessage}`);
    });
  });

  // -------------------------------------------------------------------
  // --- GET ENDERECO BY ID
  // -------------------------------------------------------------------

  describe("getEnderecoById", () => {
    it("deve retornar endereço quando encontrado", async () => {
      (mockEnderecoCliente.findByPk as jest.Mock).mockResolvedValue(
        mockEnderecoData
      );

      const result = await EnderecoClienteService.getEnderecoById(1);

      expect(mockEnderecoCliente.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEnderecoData);
    });

    it("deve retornar null quando endereço não for encontrado", async () => {
      (mockEnderecoCliente.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await EnderecoClienteService.getEnderecoById(999);

      expect(result).toBeNull();
    });

    it("deve lançar erro ao falhar na busca", async () => {
      const errorMessage = "Erro de conexão";
      (mockEnderecoCliente.findByPk as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(EnderecoClienteService.getEnderecoById(1)).rejects.toThrow(
        `Erro ao buscar endereço: ${errorMessage}`
      );
    });
  });

  // -------------------------------------------------------------------
  // --- GET ALL ENDERECOS BY CLIENTE
  // -------------------------------------------------------------------

  describe("getAllEnderecosByCliente", () => {
    it("deve retornar lista de endereços ativos do cliente", async () => {
      const mockEnderecos = [mockEnderecoData];
      (mockEnderecoCliente.findAll as jest.Mock).mockResolvedValue(
        mockEnderecos
      );

      const result = await EnderecoClienteService.getAllEnderecosByCliente(1);

      expect(mockEnderecoCliente.findAll).toHaveBeenCalledWith({
        where: {
          cliente_idcliente: 1,
          ativo: true,
        },
      });
      expect(result).toEqual(mockEnderecos);
    });

    it("deve retornar array vazio quando cliente não tiver endereços", async () => {
      (mockEnderecoCliente.findAll as jest.Mock).mockResolvedValue([]);

      const result = await EnderecoClienteService.getAllEnderecosByCliente(999);

      expect(result).toEqual([]);
    });

    it("deve lançar erro quando ID do cliente for inválido", async () => {
      await expect(
        EnderecoClienteService.getAllEnderecosByCliente(NaN)
      ).rejects.toThrow("ID do cliente é inválido (NaN)");
    });

    it("deve lançar erro ao falhar na busca", async () => {
      const errorMessage = "Erro de banco de dados";
      (mockEnderecoCliente.findAll as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(
        EnderecoClienteService.getAllEnderecosByCliente(1)
      ).rejects.toThrow(`Erro ao buscar endereços do cliente: ${errorMessage}`);
    });
  });

  // -------------------------------------------------------------------
  // --- UPDATE ENDERECO
  // -------------------------------------------------------------------

  describe("updateEndereco", () => {
    const updateData = {
      nome_endereco: "Trabalho",
      logradouro: "Av. Paulista",
    };

    it("deve atualizar endereço com sucesso", async () => {
      const mockUpdatedEndereco = {
        ...mockEnderecoData,
        ...updateData,
      };

      (mockEnderecoCliente.update as jest.Mock).mockResolvedValue([
        1,
        [mockUpdatedEndereco],
      ]);

      const result = await EnderecoClienteService.updateEndereco(1, updateData);

      expect(mockEnderecoCliente.update).toHaveBeenCalledWith(updateData, {
        where: { idendereco_cliente: 1 },
        returning: true,
      });
      expect(result).toEqual([1, [mockUpdatedEndereco]]);
    });

    it("deve retornar [0, []] quando endereço não for encontrado", async () => {
      (mockEnderecoCliente.update as jest.Mock).mockResolvedValue([0, []]);

      const result = await EnderecoClienteService.updateEndereco(
        999,
        updateData
      );

      expect(result).toEqual([0, []]);
    });

    it("deve lançar erro ao falhar na atualização", async () => {
      const errorMessage = "Erro de validação";
      (mockEnderecoCliente.update as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(
        EnderecoClienteService.updateEndereco(1, updateData)
      ).rejects.toThrow(`Erro ao atualizar endereço: ${errorMessage}`);
    });
  });

  // -------------------------------------------------------------------
  // --- DELETE ENDERECO
  // -------------------------------------------------------------------

  describe("deleteEndereco", () => {
    it("deve desativar endereço com sucesso", async () => {
      (mockEnderecoCliente.update as jest.Mock).mockResolvedValue([1]);

      const result = await EnderecoClienteService.deleteEndereco(1);

      expect(mockEnderecoCliente.update).toHaveBeenCalledWith(
        { ativo: false },
        {
          where: {
            idendereco_cliente: 1,
            ativo: true,
          },
        }
      );
      expect(result).toBe(1);
    });

    it("deve retornar 0 quando endereço não for encontrado ou já estiver inativo", async () => {
      (mockEnderecoCliente.update as jest.Mock).mockResolvedValue([0]);

      const result = await EnderecoClienteService.deleteEndereco(999);

      expect(result).toBe(0);
    });

    it("deve lançar erro genérico ao falhar na desativação", async () => {
      (mockEnderecoCliente.update as jest.Mock).mockRejectedValue(
        new Error("Erro de BD")
      );

      await expect(EnderecoClienteService.deleteEndereco(1)).rejects.toThrow(
        "Erro no banco de dados ao tentar desativar o endereço."
      );
    });
  });
});
