import ClienteService from "../../src/services/ClienteService";
import Cliente from "../../src/models/Cliente";

jest.mock("../../src/models/Cliente", () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

const mockCliente = {
  idcliente: 1,
  email: "teste@example.com",
  nome: "Cliente Teste",
  senha: "hashedpassword",
  documento_identificacao: "12345678901",
  data_nascimento: new Date("1990-01-01"),
  numero_contato: "11999999999",
  imagem_perfil_url: null,
  toJSON: () => mockCliente,
};

describe("ClienteService - Testes Unitários", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um novo cliente com sucesso", async () => {
    (Cliente.create as jest.Mock).mockResolvedValue(mockCliente as any);

    const data = {
      email: "novo@example.com",
      nome: "Novo Cliente",
      senha: "password123",
      documento_identificacao: "11122233344",
      data_nascimento: "1995-05-05",
      numero_contato: "11888888888",
      imagem_perfil_url: null,
    };

    const result = await ClienteService.createCliente(data);

    expect(Cliente.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockCliente);
  });

  it("deve retornar um cliente ao buscar por um id existente", async () => {
    (Cliente.findByPk as jest.Mock).mockResolvedValue(mockCliente as any);

    const result = await ClienteService.getClienteById(1);

    expect(Cliente.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockCliente);
  });

  it("deve retornar null ao buscar por um id inexistente", async () => {
    (Cliente.findByPk as jest.Mock).mockResolvedValue(null);

    const result = await ClienteService.getClienteById(999);

    expect(Cliente.findByPk).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  it("deve retornar uma lista de clientes ao buscar todos", async () => {
    const mockClientesList = [
      mockCliente,
      { ...mockCliente, idcliente: 2, email: "outro@ex.com" },
    ];
    (Cliente.findAll as jest.Mock).mockResolvedValue(mockClientesList as any);

    const result = await ClienteService.getAllClientes();

    expect(Cliente.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result).toEqual(mockClientesList);
  });

  it("deve atualizar um cliente e retornar a contagem de linhas afetadas", async () => {
    const updateData = { nome: "Cliente Atualizado" };
    (Cliente.update as jest.Mock).mockResolvedValue([1, [mockCliente]] as any);

    const result = await ClienteService.updateCliente(1, updateData);

    expect(Cliente.update).toHaveBeenCalledWith(updateData, {
      where: { idcliente: 1 },
      returning: true,
    });
    expect(result[0]).toBe(1);
  });

  it("deve retornar 0 ao tentar atualizar cliente inexistente", async () => {
    const updateData = { nome: "Cliente Inexistente" };
    (Cliente.update as jest.Mock).mockResolvedValue([0, []] as any);

    const result = await ClienteService.updateCliente(999, updateData);

    expect(result[0]).toBe(0);
  });

  it("deve deletar um cliente e retornar 1 (linha excluída)", async () => {
    (Cliente.destroy as jest.Mock).mockResolvedValue(1);

    const deletedRows = await ClienteService.deleteCliente(1);

    expect(Cliente.destroy).toHaveBeenCalledWith({ where: { idcliente: 1 } });
    expect(deletedRows).toBe(1);
  });

  it("deve retornar 0 ao tentar deletar cliente inexistente", async () => {
    (Cliente.destroy as jest.Mock).mockResolvedValue(0);

    const deletedRows = await ClienteService.deleteCliente(999);

    expect(deletedRows).toBe(0);
  });
});
