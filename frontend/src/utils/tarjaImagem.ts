// utils/productUtils.ts (Crie este arquivo ou use um arquivo de utils existente)
import { TarjaImages } from "../utils/tarja"; // Assumindo que este caminho é correto

// Reutilize a tipagem Product do seu EstablishmentDetails.tsx
export type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  nome_comercial: string;
  classe_terapeutica: string;
  detentor_registro: string;
  registro_anvisa: string;
  valor_venda: string;
  preco_cmed: string;
  substancia_ativa: string;
  disponibilidade: boolean;
  link_bula: string;
  apresentacao: string;
  tarja: string;
  tipo_produto: string;
};

type ImageSourceResult = {
  source: any;
  isUsingPlaceholder: boolean;
};

/**
 * Retorna o source da imagem da tarja e um flag indicando se é um placeholder.
 * @param product O objeto completo do produto.
 */
export const getProductImageSource = (product: Product): ImageSourceResult => {
  let tarja = product.tarja || "Sem Tarja";
  const tipoProduto = product.tipo_produto || "Outros";
  const isGeneric =
    tipoProduto.toLowerCase().includes("genérico") ||
    tipoProduto.toLowerCase().includes("generico");

  // 🛑 1. TRATAMENTO DE VARIAÇÕES DE TARJA
  if (tarja.toLowerCase().includes("sob restrição")) {
    tarja = tarja.split(" ")[0]; // Normaliza para 'Vermelha'
  }

  // Garante que a Tarja seja padronizada para as chaves do mapa
  const padronizedTarja = tarja.includes("Tarja")
    ? tarja
    : tarja.charAt(0).toUpperCase() + tarja.slice(1).toLowerCase();

  // 🛑 2. CONSTRUÇÃO DA CHAVE ÚNICA
  let imageKey: keyof typeof TarjaImages;

  if (tarja.toLowerCase().includes("sem tarja")) {
    imageKey = isGeneric ? "Sem Tarja Generico" : "Sem Tarja";
  } else if (isGeneric) {
    const prefixoTarja = padronizedTarja.split(" ")[0];
    // Ex: 'Vermelha' + ' Generico'
    imageKey = `${prefixoTarja} Generico` as keyof typeof TarjaImages;
  } else {
    imageKey = padronizedTarja as keyof typeof TarjaImages;
  }

  // 🛑 3. BUSCA DA IMAGEM (com fallback)
  const mainImageSource = TarjaImages[imageKey] || TarjaImages["Sem Tarja"];

  // 🛑 4. VERIFICAÇÃO DE PLACEHOLDER
  const isUsingPlaceholder = mainImageSource === TarjaImages["Sem Tarja"];

  return { source: mainImageSource, isUsingPlaceholder };
};
