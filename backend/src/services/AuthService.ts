import Cliente from "../models/Cliente";
import Estabelecimento from "../models/Estabelecimento";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import EstabelecimentoService from "./EstabelecimentoService";

interface LoginResult {
  token: string;
  cliente?: any;
  estabelecimento?: any;
}

class AuthService {
  public async registerCliente(data: any): Promise<Cliente> {
    const {
      email,
      nome,
      senha,
      documento_identificacao,
      data_nascimento,
      numero_contato,
      imagem_perfil_url,
    } = data;
    const hashedPassword = await bcrypt.hash(senha, 10);
    const cliente = await Cliente.create({
      email,
      nome,
      senha: hashedPassword,
      documento_identificacao,
      data_nascimento,
      numero_contato,
      imagem_perfil_url,
    });
    return cliente;
  }

  public async loginCliente(
    email: string,
    senha: string
  ): Promise<LoginResult | null> {
    const cliente = await Cliente.findOne({ where: { email } });

    if (!cliente) {
      return null; 
    }

    const isPasswordValid = await bcrypt.compare(senha, cliente.senha);
    if (!isPasswordValid) {
      return null; 
    }

    const token = jwt.sign(
      { id: cliente.idcliente, email: cliente.email, type: "cliente" },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const clienteData = {
      idcliente: cliente.idcliente,
      email: cliente.email,
      nome: cliente.nome,
      documento_identificacao: cliente.documento_identificacao,
      data_nascimento: cliente.data_nascimento,
      numero_contato: cliente.numero_contato,
      imagem_perfil_url: cliente.imagem_perfil_url,
    };

    return {
      token,
      cliente: clienteData,
    };
  }

  public async registerEstabelecimento(data: any): Promise<Estabelecimento> {
    const {
      cnpj,
      senha,
    } = data;

    const hashedPassword = await bcrypt.hash(senha, 10);

    const dataWithHashedPassword = {
      ...data,
      senha: hashedPassword,
    };

    const estabelecimento = await EstabelecimentoService.createEstabelecimento(
      dataWithHashedPassword
    );

    return estabelecimento;
  }

  public async loginEstabelecimento(
    email: string,
    senha: string
  ): Promise<LoginResult | null> {
    const estabelecimento = await Estabelecimento.findOne({ where: { email } });

    if (!estabelecimento) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(senha, estabelecimento.senha);
    if (!isPasswordValid) {
      return null;
    }

    const token = jwt.sign(
      {
        id: estabelecimento.idestabelecimento,
        email: estabelecimento.email,
        type: "estabelecimento",
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    const estabelecimentoData = {
      idestabelecimento: estabelecimento.idestabelecimento,
      email: estabelecimento.email,
      cnpj: estabelecimento.cnpj,
      razao_social: estabelecimento.razao_social,
      registro_anvisa: estabelecimento.registro_anvisa,
      responsavel_tecnico: estabelecimento.responsavel_tecnico,
      telefone_contato: estabelecimento.telefone_contato,
      conta_bancaria: estabelecimento.conta_bancaria,
      raio_cobertura: estabelecimento.raio_cobertura,
      valor_minimo_entrega: estabelecimento.valor_minimo_entrega,
      taxa_entrega: estabelecimento.taxa_entrega,
      logo_url: estabelecimento.logo_url,
    };
    return {
      token,
      estabelecimento: estabelecimentoData,
    };
  }
}

export default new AuthService();
