export const TarjaImages = {
  Vermelha: require("../../assets/tarja_vermelha.png"),
  "Vermelha Generico": require("../../assets/tarja_vermelha_generico.png"),
  Preta: require("../../assets/tarja_preta.png"),
  "Preta Generico": require("../../assets/tarja_preta_generico.png"),
  "Sem Tarja": require("../../assets/sem_tarja.png"),
  "Sem Tarja Generico": require("../../assets/sem_tarja_generico.png"),
};

interface ProductImageInfo {
  tarja: string;
  tipo_produto: string;
}

/**
 * Seleciona o source da imagem da tarja/tipo de produto com base na lógica combinada.
 * @param productInfo - Objeto com tarja e tipo_produto.
 * @returns ImageSourcePropType
 */
export const getTarjaImageSource = (
  productInfo: ProductImageInfo
): ImageSourcePropType => {
  let tarja = productInfo.tarja || "Sem Tarja";
  const tipoProduto = productInfo.tipo_produto || "Outros";
  const isGeneric =
    tipoProduto.toLowerCase().includes("genérico") ||
    tipoProduto.toLowerCase().includes("generico");

  // --- Tratamento de Variações de Tarja ---
  if (tarja.toLowerCase().includes("sob restrição")) {
    tarja = tarja.split(" ")[0]; // Normaliza 'Vermelha sob restrição' para 'Vermelha'
  }

  // Garante que a Tarja seja padronizada para as chaves do mapa (ex: 'Vermelha')
  const padronizedTarja = tarja.includes("Tarja")
    ? tarja
    : tarja.charAt(0).toUpperCase() + tarja.slice(1).toLowerCase();

  // --- Construção da Chave Única ---
  let imageKey: keyof typeof TarjaImages;

  if (tarja.toLowerCase().includes("sem tarja")) {
    // Se a tarja é "Sem Tarja", monta a chave de Sem Tarja
    imageKey = isGeneric ? "Sem Tarja Generico" : "Sem Tarja";
  } else if (isGeneric) {
    // Caso Tarja (Vermelha/Preta) E Genérico
    const prefixoTarja = padronizedTarja.split(" ")[0];
    imageKey = `${prefixoTarja} Generico` as keyof typeof TarjaImages;
  } else {
    // Caso Tarja (Vermelha/Preta) E NÃO Genérico
    imageKey = padronizedTarja as keyof typeof TarjaImages;
  }

  // --- Busca e Fallback ---
  // Faz o casting para garantir que a chave é válida
  const mainImageSource = (TarjaImages as any)[imageKey];

  return mainImageSource || TarjaImages["Sem Tarja"];
};
