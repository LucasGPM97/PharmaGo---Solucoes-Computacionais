import EnderecoEstabelecimento from "../models/EnderecoEstabelecimento";

class EnderecoEstabelecimentoService {
  // Nome da classe ajustado
  public async createEndereco(data: any): Promise<EnderecoEstabelecimento> {
    const {
      estabelecimento_idestabelecimento,
      uf,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      latitude,
      longitude,
    } = data;
    const endereco = await EnderecoEstabelecimento.create({
      estabelecimento_idestabelecimento,
      uf,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
      cep,
      latitude,
      longitude,
    });
    return endereco;
  }

  public async getEnderecoById(
    idendereco_estabelecimento: number
  ): Promise<EnderecoEstabelecimento | null> {
    const endereco = await EnderecoEstabelecimento.findByPk(
      idendereco_estabelecimento
    );
    return endereco;
  }

  // Renomeado para buscar por Estabelecimento
  public async getAllEnderecosByEstabelecimento(
    estabelecimento_idestabelecimento: number
  ): Promise<EnderecoEstabelecimento[]> {
    const enderecos = await EnderecoEstabelecimento.findAll({
      where: { estabelecimento_idestabelecimento },
    });
    return enderecos;
  }

  public async updateEndereco(
    idendereco_estabelecimento: number,
    data: any
  ): Promise<[number, EnderecoEstabelecimento[]]> {
    const [affectedCount, affectedRows] = await EnderecoEstabelecimento.update(
      data,
      {
        where: { idendereco_estabelecimento },
        returning: true,
        // O `affectedRows` retornado pelo Sequelize é um array contendo os objetos atualizados (depende do dialect)
      }
    );
    // Retorna apenas a contagem de afetados, conforme o esperado pelo Controller
    return [affectedCount, affectedRows as EnderecoEstabelecimento[]];
  }

  public async deleteEndereco(
    idendereco_estabelecimento: number
  ): Promise<number> {
    const deletedRows = await EnderecoEstabelecimento.destroy({
      where: { idendereco_estabelecimento },
    });
    return deletedRows;
  }
}

export default new EnderecoEstabelecimentoService(); // Exportação ajustada
