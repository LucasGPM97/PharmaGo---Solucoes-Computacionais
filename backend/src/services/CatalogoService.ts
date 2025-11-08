// CatalogoService.ts
import Catalogo from "../models/Catalogo";

class CatalogoService {
  public async createCatalogo(estabelecimentoId: number): Promise<Catalogo> {
    try {
      const catalogo = await Catalogo.create({
        idcatalogo: estabelecimentoId,
        estabelecimento_idestabelecimento: estabelecimentoId,
      });
      console.log("sucesso ao criar catalogo");
      return catalogo;
    } catch (error) {
      console.error("Erro ao criar catálogo:", error);
      throw new Error("Erro ao criar catálogo para o estabelecimento");
    }
  }

  public async getCatalogoByEstabelecimentoId(
    estabelecimentoId: number
  ): Promise<Catalogo | null> {
    return await Catalogo.findOne({
      where: { estabelecimento_idestabelecimento: estabelecimentoId },
    });
  }
}

export default new CatalogoService();
