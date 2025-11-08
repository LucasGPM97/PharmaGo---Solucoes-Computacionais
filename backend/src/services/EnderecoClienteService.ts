import EnderecoCliente from "../models/EnderecoCliente";

class EnderecoClienteService {
  public async createEndereco(data: any): Promise<EnderecoCliente> {
    try {
      console.log("📍 Service - Criando endereço com dados:", data);

      const {
        cliente_idcliente,
        uf,
        nome_endereco,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        latitude,
        longitude,
        complemento,
      } = data;

      const endereco = await EnderecoCliente.create({
        cliente_idcliente,
        uf,
        nome_endereco,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        latitude: latitude || "0.0",
        longitude: longitude || "0.0",
        complemento: complemento || null,
      });

      console.log("✅ Service - Endereço criado:", endereco.idendereco_cliente);
      return endereco;
    } catch (error: any) {
      console.error("❌ Service - Erro ao criar endereço:", error);
      throw new Error(`Erro ao criar endereço: ${error.message}`);
    }
  }

  public async getEnderecoById(
    idendereco_cliente: number
  ): Promise<EnderecoCliente | null> {
    try {
      const endereco = await EnderecoCliente.findByPk(idendereco_cliente);
      return endereco;
    } catch (error: any) {
      console.error("❌ Service - Erro ao buscar endereço por ID:", error);
      throw new Error(`Erro ao buscar endereço: ${error.message}`);
    }
  }

  public async getAllEnderecosByCliente(
    idcliente: number
  ): Promise<EnderecoCliente[]> {
    try {
      console.log(
        `📍 Service - Buscando endereços para cliente ID: ${idcliente} (tipo: ${typeof idcliente})`
      );

      if (isNaN(idcliente)) {
        throw new Error("ID do cliente é inválido (NaN)");
      }

      const enderecos = await EnderecoCliente.findAll({
        where: {
          cliente_idcliente: idcliente,
          ativo: true,
        },
      });

      console.log(`✅ Service - Encontrados ${enderecos.length} endereços`);
      return enderecos;
    } catch (error: any) {
      console.error(`❌ Service - Erro ao buscar endereços do cliente:`, error);
      throw new Error(`Erro ao buscar endereços do cliente: ${error.message}`);
    }
  }

  public async updateEndereco(
    idendereco_cliente: number,
    data: any
  ): Promise<[number, EnderecoCliente[]]> {
    try {
      const [affectedCount, affectedRows] = await EnderecoCliente.update(data, {
        where: { idendereco_cliente },
        returning: true,
      });
      return [affectedCount, affectedRows as EnderecoCliente[]];
    } catch (error: any) {
      console.error("❌ Service - Erro ao atualizar endereço:", error);
      throw new Error(`Erro ao atualizar endereço: ${error.message}`);
    }
  }

  public async deleteEndereco(idendereco_cliente: number): Promise<number> {
    try {
      console.log(
        `⏳ Service - Tentando desativar EnderecoCliente ID: ${idendereco_cliente}`
      );

      const [affectedRows] = await EnderecoCliente.update(
        { ativo: false },
        {
          where: {
            idendereco_cliente,
            ativo: true,
          },
        }
      );

      if (affectedRows === 0) {
        console.log(
          `⚠️ Service - Endereço ID ${idendereco_cliente} não encontrado ou já estava inativo.`
        );
      } else {
        console.log(
          `✅ Service - Endereço ID ${idendereco_cliente} desativado com sucesso.`
        );
      }
      return affectedRows;
    } catch (error: any) {
      console.error("❌ Service - Erro ao desativar endereço:", error);
      throw new Error("Erro no banco de dados ao tentar desativar o endereço.");
    }
  }
}

export default new EnderecoClienteService();
