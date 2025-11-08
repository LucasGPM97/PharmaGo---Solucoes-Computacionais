import { EnderecoEstabelecimento } from "../models";
import Catalogo from "../models/Catalogo";
import Estabelecimento from "../models/Estabelecimento";
import HorarioFuncionamento from "../models/HorarioFuncionamento";
import CatalogoService from "./CatalogoService";

class EstabelecimentoService {
  public async createDefaultOperatingHours(idestabelecimento: number) {

    const daysOfWeek = Array.from({ length: 7 }, (_, i) => i);
    const defaultTime = {
      horario_abertura: "08:00:00",
      horario_fechamento: "18:00:00",
      fechado: false, 
    };

    const hoursToCreate = daysOfWeek.map((day) => ({
      estabelecimento_idestabelecimento: idestabelecimento,
      dia: day,
      ...defaultTime,
    }));

    try {
      console.log(
        `Tentando criar ${hoursToCreate.length} horários para o Estabelecimento ID: ${idestabelecimento}`
      );

      await HorarioFuncionamento.bulkCreate(hoursToCreate);
      console.log(
        `Horários de funcionamento padrão criados para o estabelecimento ${idestabelecimento}`
      );
    } catch (error) {
      console.error(
        `ERRO (bulkCreate) ao criar horários para o Estabelecimento ID ${idestabelecimento}:`,
        error
      );
      throw new Error(
        "Falha ao criar horários de funcionamento padrão: " +
          (error as Error).message
      );
    }
  }

  public async createCatalogo(idestabelecimento: number) {
    const estabelecimento_idestabelecimento = idestabelecimento;

    try {
      const catalogo = await Catalogo.create({
        idcatalogo: idestabelecimento,
        estabelecimento_idestabelecimento: idestabelecimento,
      });
      console.log("sucesso ao criar catalogo");
      return catalogo;
    } catch (error) {
      console.error("Erro ao criar catálogo:", error);
      throw new Error("Erro ao criar catálogo para o estabelecimento");
    }
  }
  public async createEstabelecimento(data: any): Promise<Estabelecimento> {
    const {
      cnpj,
      email,
      razao_social,
      registro_anvisa,
      responsavel_tecnico,
      telefone_contato,
      conta_bancaria,
      raio_cobertura,
      valor_minimo_entrega,
      taxa_entrega,
      logo_url: caminho_imagem_logo,
      senha,
    } = data;

    console.log("Iniciando a criação do Estabelecimento...");

    const estabelecimento = await Estabelecimento.create({
      cnpj,
      email,
      razao_social,
      registro_anvisa,
      responsavel_tecnico,
      telefone_contato,
      conta_bancaria,
      raio_cobertura,
      valor_minimo_entrega,
      taxa_entrega,
      caminho_imagem_logo,
      senha,
    });

    console.log(
      `Estabelecimento criado com sucesso. ID gerado: ${estabelecimento.idestabelecimento}`
    );
    console.log("Prosseguindo para a criação dos horários padrão...");

    await this.createDefaultOperatingHours(estabelecimento.idestabelecimento);
    await this.createCatalogo(estabelecimento.idestabelecimento);

    console.log("Criação de Estabelecimento e Horários concluída.");

    return estabelecimento;
  }

  public async getEstabelecimentoById(
    idestabelecimento: number
  ): Promise<Estabelecimento | null> {
    const estabelecimento = await Estabelecimento.findByPk(idestabelecimento, {
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
    return estabelecimento;
  }

  public async getAllEstabelecimentos(): Promise<Estabelecimento[]> {
    const estabelecimentos = await Estabelecimento.findAll({
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
    return estabelecimentos;
  }

  public async updateEstabelecimento(
    idestabelecimento: number,
    data: any
  ): Promise<[number, Estabelecimento[]]> {
    const [affectedCount, affectedRows] = await Estabelecimento.update(data, {
      where: { idestabelecimento },
      returning: true,
    });
    return [affectedCount, affectedRows];
  }

  public async deleteEstabelecimento(
    idestabelecimento: number
  ): Promise<number> {
    const deletedRows = await Estabelecimento.destroy({
      where: { idestabelecimento },
    });
    return deletedRows;
  }
}

export default new EstabelecimentoService();
