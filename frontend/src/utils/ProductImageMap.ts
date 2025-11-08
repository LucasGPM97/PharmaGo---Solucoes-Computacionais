// src/utils/ProductImageMap.ts

import { ImageSourcePropType } from "react-native";

// 1. Defina o tipo de chave de combinação
type ProductKey = `${string}_${string}_${string}`;

// 2. Mapeie todas as combinações para suas respectivas referências de require()
// Atenção: O require DEVE ser feito aqui para que o bundler do React Native encontre as imagens.
export const ImageMap: Record<ProductKey, ImageSourcePropType> = {
  // Exemplo 1: Vermelho | Comprimido | Genérico
  Vermelho_Comprimido_Generico: require("../../assets/adaptive-icon.png"),

  // Exemplo 2: Preto | Cápsula | Novo
  Preto_Capsula_Novo: require("../../assets/favicon.png"),

  // Exemplo 3: Sem Tarja | Líquido | Similar
  SemTarja_Liquido_Similar: require("../../assets/splash-icon.png"),

  // ... Adicione todas as suas combinações aqui!
  // Se uma combinação não for encontrada, você pode definir uma imagem Padrão
  DEFAULT_IMAGE: require("../../assets/splash-icon.png"),
};

// 3. Crie uma função utilitária para obter a imagem
export const getProductImageSource = (
  tarja: string,
  formaTerapeutica: string,
  tipoProduto: string
): ImageSourcePropType | undefined => {
  // Constrói a chave no formato "Tarja_Forma_Tipo"
  // Normaliza para lidar com espaços e letras maiúsculas/minúsculas, se necessário.
  const key: ProductKey = `${tarja}_${formaTerapeutica}_${tipoProduto}`.replace(
    /\s/g,
    ""
  ); // Remove espaços para criar uma chave limpa

  // Tenta buscar a imagem no mapa
  const imageSource = ImageMap[key];

  // Retorna a imagem encontrada ou um valor undefined (você pode retornar uma imagem padrão aqui)
  return imageSource || ImageMap["DEFAULT_IMAGE"]; // Se você tiver uma DEFAULT_IMAGE
};
