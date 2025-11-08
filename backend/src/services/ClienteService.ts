import Cliente from "../models/Cliente";

class ClienteService {
  public async createCliente(data: any): Promise<Cliente> {
    const {
      email,
      nome,
      senha,
      documento_identificacao,
      data_nascimento,
      numero_contato,
      imagem_perfil_url,
    } = data;
    const cliente = await Cliente.create({
      email,
      nome,
      senha,
      documento_identificacao,
      data_nascimento,
      numero_contato,
      imagem_perfil_url,
    });
    return cliente;
  }

  public async getClienteById(idcliente: number): Promise<Cliente | null> {
    const cliente = await Cliente.findByPk(idcliente);
    return cliente;
  }

  public async getAllClientes(): Promise<Cliente[]> {
    const clientes = await Cliente.findAll();
    return clientes;
  }

  public async updateCliente(
    idcliente: number,
    data: any
  ): Promise<[number, Cliente[]]> {
    const [affectedCount, affectedRows] = await Cliente.update(data, {
      where: { idcliente },
      returning: true,
    });
    return [affectedCount, affectedRows];
  }

  public async deleteCliente(idcliente: number): Promise<number> {
    const deletedRows = await Cliente.destroy({
      where: { idcliente },
    });
    return deletedRows;
  }
}

export default new ClienteService();
