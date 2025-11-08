import Produto from "../models/Produto";
import { literal, Op } from "sequelize";
import sequelize from "../config/database";

class ProdutoService {
  public async createProduto(data: any): Promise<Produto> {
    const {
      nome_comercial,
      substancia_ativa,
      apresentacao,
      registro_anvisa,
      detentor_registro,
      link_bula,
      preco_cmed,
      requer_receita,
      classe_terapeutica,
      tipo_produto,
      tarja,
      forma_terapeutica,
    } = data;
    const produto = await Produto.create({
      nome_comercial,
      substancia_ativa,
      apresentacao,
      registro_anvisa,
      detentor_registro,
      link_bula,
      preco_cmed,
      requer_receita,
      classe_terapeutica,
      tipo_produto,
      tarja,
      forma_terapeutica,
    });
    return produto;
  }

  public async getProdutoById(idproduto: number): Promise<Produto | null> {
    console.log("Buscando produto no banco com ID:", idproduto); 
    const produto = await Produto.findByPk(idproduto); 
    return produto;
  }

  public async getAllProdutos(): Promise<Produto[]> {
    const produtos = await Produto.findAll();
    return produtos;
  }

  public async updateProduto(
    idproduto: number,
    data: any
  ): Promise<[number, Produto[]]> {
    const [affectedCount, affectedRows] = await Produto.update(data, {
      where: { idproduto },
      returning: true,
    });
    return [affectedCount, affectedRows];
  }

  public async deleteProduto(idproduto: number): Promise<number> {
    const deletedRows = await Produto.destroy({
      where: { idproduto },
    });
    return deletedRows;
  }

  public async getDistinctClassesTerapeuticas(): Promise<any[]> {
    try {
      const distinctClasses = await Produto.findAll({
        attributes: [
          [
            sequelize.fn("DISTINCT", sequelize.col("classe_terapeutica")),
            "classe_terapeutica",
          ],
        ],
        raw: true,
      });
      return distinctClasses;
    } catch (error) {
      console.error("Erro ao buscar classes terapêuticas distintas:", error);
      throw new Error("Falha ao buscar as classes terapêuticas distintas.");
    }
  }

  public async getProdutosByClasseTerapeutica(
    classe: string
  ): Promise<Produto[]> {
    if (!classe) {
      throw new Error("A classe terapêutica é obrigatória para a busca.");
    }

    const lowerCaseClasse = classe.toLowerCase();
    const produtos = await Produto.findAll({
      where: {
        [Op.and]: [
          sequelize.where(
            literal("LOWER(classe_terapeutica)"), 
            lowerCaseClasse 
          ),
        ],
      },
    });

    return produtos;
  }
}

export default new ProdutoService();
