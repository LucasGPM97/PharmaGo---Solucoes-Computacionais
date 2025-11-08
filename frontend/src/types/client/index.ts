
import { Estabelecimento } from "../establishment";

export interface Cliente {
  idcliente: number; 
  nome: string;
  email: string;
  imagem_perfil_url?: string;
  documento_identificacao: string;
  data_nascimento: string; 
  numero_contato: string;
}

export interface Produto {
  idproduto: string; 
  idcatalogo_produto: number;
  apresentacao: string;
  descricao: string;
  classe_terapeutica: string;
  preco: number; 
  imagens?: ProdutoImagem[];
  disponibilidade: boolean;
  detentor_registro: string;
  nome_comercial: string;
  registro_anvisa: number;
  preco_cmed: number;
  tarja: string;
}

export interface ProdutoImagem {
  idproduto_imagem: number;
  url: string;
  produtoId: number;
}

export interface CatalogoProduto {
  idcatalogo_produto: number;
  idproduto: number;
  estabelecimentoId: number;
  preco: number;
  estoque: number;
  produto: Produto;
}

export interface PedidoItem {
  idpedido_item: number;
  catalogoProdutoId: number;
  quantidade: number;
  precoUnitario: number;
  catalogoProduto: CatalogoProduto;
}

export interface Pedido {
  idpedido: number;
  clienteId: number;
  estabelecimentoId: number;
  status: string;
  total: number;
  itens: PedidoItem[];
}

export interface CarrinhoItem {
  id: number;
  catalogoProdutoId: number;
  quantidade: number;
  catalogoProduto: CatalogoProduto;
}

export interface Carrinho {
  id: number; 
  clienteId: number;
  itens: CarrinhoItem[];
}
