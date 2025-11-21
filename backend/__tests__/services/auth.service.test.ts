import AuthService from "../../src/services/AuthService";
import Cliente from "../../src/models/Cliente";
import Estabelecimento from "../../src/models/Estabelecimento";
import EstabelecimentoService from "../../src/services/EstabelecimentoService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../src/models/Cliente");
jest.mock("../../src/models/Estabelecimento");
jest.mock("../../src/services/EstabelecimentoService");

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockCliente = Cliente as jest.MockedClass<typeof Cliente>;
const mockEstabelecimento = Estabelecimento as jest.MockedClass<
  typeof Estabelecimento
>;
const mockEstabelecimentoService = EstabelecimentoService as jest.Mocked<
  typeof EstabelecimentoService
>;

describe("AuthService", () => {
  const MOCK_HASHED_PASSWORD = "hashedPassword123";
  const MOCK_TOKEN = "mocked.jwt.token";

  const mockClienteData = {
    idcliente: 1,
    email: "test@cliente.com",
    nome: "Cliente Teste",
    senha: MOCK_HASHED_PASSWORD,
    toJSON: () => ({
      idcliente: 1,
      email: "test@cliente.com",
      nome: "Cliente Teste",
    }),
  } as any;

  const mockEstabelecimentoData = {
    idestabelecimento: 10,
    email: "test@farmacia.com",
    razao_social: "Farmacia Teste LTDA",
    cnpj: "12345678000100",
    senha: MOCK_HASHED_PASSWORD,
    toJSON: () => ({
      idestabelecimento: 10,
      email: "test@farmacia.com",
      razao_social: "Farmacia Teste LTDA",
    }),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret_for_auth";

    (mockBcrypt.hash as jest.Mock) = jest.fn();
    (mockBcrypt.compare as jest.Mock) = jest.fn();
    (mockJwt.sign as jest.Mock) = jest.fn();
  });

  // -------------------------------------------------------------------
  // --- CLIENTE AUTH
  // -------------------------------------------------------------------

  describe("registerCliente", () => {
    it("deve registrar um cliente com sucesso e hashear a senha", async () => {
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(MOCK_HASHED_PASSWORD);
      (mockCliente.create as jest.Mock).mockResolvedValue(mockClienteData);

      const data = {
        email: "new@user.com",
        senha: "plainPassword",
        nome: "New User",
      };
      const result = await AuthService.registerCliente(data);

      expect(mockBcrypt.hash).toHaveBeenCalledWith("plainPassword", 10);
      expect(mockCliente.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@user.com",
          senha: MOCK_HASHED_PASSWORD,
        })
      );
      expect(result).toBe(mockClienteData);
    });
  });

  describe("loginCliente", () => {
    const email = mockClienteData.email;
    const senha = "plainPassword";

    it("deve retornar token e dados do cliente em caso de login bem-sucedido", async () => {
      (mockCliente.findOne as jest.Mock).mockResolvedValue(mockClienteData);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue(MOCK_TOKEN);

      const result = await AuthService.loginCliente(email, senha);

      expect(mockCliente.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        senha,
        MOCK_HASHED_PASSWORD
      );
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: mockClienteData.idcliente, email, type: "cliente" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(result).toEqual({
        token: MOCK_TOKEN,
        cliente: expect.any(Object),
      });
    });

    it("deve retornar null se o cliente não for encontrado", async () => {
      (mockCliente.findOne as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.loginCliente("nao@existe.com", senha);

      expect(result).toBeNull();
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it("deve retornar null se a senha for inválida", async () => {
      (mockCliente.findOne as jest.Mock).mockResolvedValue(mockClienteData);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await AuthService.loginCliente(email, "senhaInvalida");

      expect(result).toBeNull();
      expect(mockBcrypt.compare).toHaveBeenCalled();
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------
  // --- ESTABELECIMENTO AUTH
  // -------------------------------------------------------------------

  describe("registerEstabelecimento", () => {
    it("deve hashear a senha e delegar a criação para EstabelecimentoService", async () => {
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(MOCK_HASHED_PASSWORD);
      (
        mockEstabelecimentoService.createEstabelecimento as jest.Mock
      ).mockResolvedValue(mockEstabelecimentoData);

      const data = {
        cnpj: "12345678000100",
        senha: "plainPassword",
        razao_social: "Nova Farmacia",
      };
      const result = await AuthService.registerEstabelecimento(data);

      expect(mockBcrypt.hash).toHaveBeenCalledWith("plainPassword", 10);
      expect(
        mockEstabelecimentoService.createEstabelecimento
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          ...data,
          senha: MOCK_HASHED_PASSWORD,
        })
      );
      expect(result).toBe(mockEstabelecimentoData);
    });
  });

  describe("loginEstabelecimento", () => {
    const email = mockEstabelecimentoData.email;
    const senha = "plainPassword";

    it("deve retornar token e dados do estabelecimento em caso de login bem-sucedido", async () => {
      (mockEstabelecimento.findOne as jest.Mock).mockResolvedValue(
        mockEstabelecimentoData
      );
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue(MOCK_TOKEN);

      const result = await AuthService.loginEstabelecimento(email, senha);

      expect(mockEstabelecimento.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        senha,
        MOCK_HASHED_PASSWORD
      );
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          id: mockEstabelecimentoData.idestabelecimento,
          email,
          type: "estabelecimento",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      expect(result).toEqual({
        token: MOCK_TOKEN,
        estabelecimento: expect.any(Object),
      });
    });

    it("deve retornar null se o estabelecimento não for encontrado", async () => {
      (mockEstabelecimento.findOne as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.loginEstabelecimento(
        "nao@existe.com",
        senha
      );

      expect(result).toBeNull();
    });

    it("deve retornar null se a senha do estabelecimento for inválida", async () => {
      (mockEstabelecimento.findOne as jest.Mock).mockResolvedValue(
        mockEstabelecimentoData
      );
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await AuthService.loginEstabelecimento(
        email,
        "senhaInvalida"
      );

      expect(result).toBeNull();
      expect(mockBcrypt.compare).toHaveBeenCalled();
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });
});
