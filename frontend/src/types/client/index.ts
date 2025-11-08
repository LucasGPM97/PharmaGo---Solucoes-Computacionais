// Types for Client-side (Cliente)

import { Estabelecimento } from "../establishment";

export interface Cliente {
  idcliente: number; // Alterado para idcliente e number
  nome: string;
  email: string;
  imagem_perfil_url?: string;
  documento_identificacao: string;
  data_nascimento: string; // Mantido como string (ISO date format) para facilitar o uso no frontend
  numero_contato: string;
  // Senha não deve ser incluída no type de resposta
}

export interface Produto {
  idproduto: string; // Alterado para idproduto
  idcatalogo_produto: number;
  apresentacao: string;
  descricao: string;
  classe_terapeutica: string;
  preco: number; // Preço base do produto
  imagens?: ProdutoImagem[];
  disponibilidade: boolean;
  detentor_registro: string;
  nome_comercial: string;
  registro_anvisa: number;
  preco_cmed: number;
  tarja: string;
}

export interface ProdutoImagem {
  idproduto_imagem: number; // Alterado para idproduto_imagem
  url: string;
  produtoId: number; // Alterado para number
}

export interface CatalogoProduto {
  idcatalogo_produto: number; // Alterado para idcatalogo_produto
  idproduto: number;
  estabelecimentoId: number;
  preco: number;
  estoque: number;
  produto: Produto;
}

export interface PedidoItem {
  idpedido_item: number; // Alterado para idpedido_item
  catalogoProdutoId: number;
  quantidade: number;
  precoUnitario: number;
  catalogoProduto: CatalogoProduto;
}

export interface Pedido {
  idpedido: number; // Alterado para idpedido
  clienteId: number;
  estabelecimentoId: number;
  status: string;
  total: number;
  itens: PedidoItem[];
}

export interface CarrinhoItem {
  id: number; // Manter como string ou ajustar se o backend tiver um ID
  catalogoProdutoId: number;
  quantidade: number;
  catalogoProduto: CatalogoProduto;
}

export interface Carrinho {
  id: number; // Manter como string ou ajustar se o backend tiver um ID
  clienteId: number;
  itens: CarrinhoItem[];
}
