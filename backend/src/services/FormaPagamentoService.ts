import FormaPagamento from "../models/FormaPagamento";

class FormaPagamentoService {
  public async getAllFormasPagamento(): Promise<FormaPagamento[]> {
    const formasPagamento = await FormaPagamento.findAll({
      where: { ativo: true },
      attributes: ["idforma_pagamento", "nome"],
    });
    return formasPagamento;
  }

  public async getFormaPagamentoById(
    idforma_pagamento: number
  ): Promise<FormaPagamento | null> {
    const formaPagamento = await FormaPagamento.findOne({
      where: { idforma_pagamento, ativo: true },
      attributes: ["idforma_pagamento", "nome"],
    });
    return formaPagamento;
  }
}

export default new FormaPagamentoService();
