// components/common/ProductCard.tsx (Versão Definitiva)

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
// 🛑 IMPORTANDO O TIPO CORRETO
import { Produto } from "../../types";
import { TarjaImages } from "../../utils/tarja";

interface ProductCardProps {
  product: Produto; // Usando o tipo do seu arquivo de tipagem
  categoryId: string;
  // O onPress deve receber o ID (number) e o nome (string) conforme a assinatura
  onPress: (productId: number, productName: string) => void;
  onAddToCart: (productId: string | number, productName: string) => void;
  showAddToCart?: boolean;
  cardWidth?: number;
  isLoading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  showAddToCart = true,
  cardWidth = 160,
  isLoading = false,
}) => {
  const handleAddToCart = () => {
    // Usamos product.idcatalogo_produto, pois é o ID do catálogo que precisamos para o carrinho
    onAddToCart(product.idcatalogo_produto, product.nome_comercial);
  };

  // 🛑 FORMATADOR DE PREÇO REAL
  const formatPrice = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return "R$ --";

    // Assumimos que o campo 'preco' em 'Produto' é o valor em NUMBER (Ex: 30.00)
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // 🛑 USANDO AS CHAVES DO TIPO 'PRODUTO'
  const productName = product.nome_comercial || "Produto sem nome";
  const priceDisplay = formatPrice(product.preco);

  const tarjaKey = product.tarja || "Sem Tarja";

  const imageUrl =
    product.imagens && product.imagens.length > 0
      ? product.imagens[0].url
      : null;

  return (
    <TouchableOpacity
      style={[styles.productCard, { width: cardWidth }]}
      // Passando o idcatalogo_produto, que é o identificador único neste contexto
      onPress={() => onPress(product.idcatalogo_produto, productName)}
      disabled={isLoading || !product.disponibilidade}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.productMainImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons name="image" size={32} color="#9CA3AF" />
          </View>
        )}

        {/* 🛑 TARJA COMO OVERLAY */}
        {tarjaKey !== "Sem Tarja" &&
          TarjaImages[tarjaKey as keyof typeof TarjaImages] && (
            <Image
              source={TarjaImages[tarjaKey as keyof typeof TarjaImages]}
              style={styles.tarjaImageOverlay}
              resizeMode="contain"
            />
          )}

        {/* 🛑 BADGE DE INDISPONÍVEL (Se quiser um aviso no topo) */}
        {!product.disponibilidade && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableBadgeText}>INDISPONÍVEL</Text>
          </View>
        )}
      </View>

      <Text style={styles.productName} numberOfLines={2}>
        {productName}
      </Text>

      {product.apresentacao && (
        <Text style={styles.productPresentation} numberOfLines={2}>
          {product.apresentacao}
        </Text>
      )}

      <Text style={styles.productPrice}>
        {priceDisplay} {/* 🛑 PREÇO FORMATADO COM O VALOR NUMBER DA API */}
      </Text>

      {/* Botão Adicionar ao Carrinho */}
      {showAddToCart && (
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !product.disponibilidade && styles.addToCartButtonUnavailable,
            isLoading && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={!product.disponibilidade || isLoading}
        >
          <Text
            style={[
              styles.addToCartText,
              !product.disponibilidade && styles.addToCartTextUnavailable,
            ]}
          >
            {product.disponibilidade
              ? isLoading
                ? "Adicionando..."
                : "Adicionar"
              : "Indisponível"}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// ... (Styles)
const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 12,
    position: "relative",
    minHeight: 280,
    justifyContent: "space-between",
  },
  imageContainer: {
    width: "100%",
    height: 96,
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  productMainImage: { width: "100%", height: "100%" },

  tarjaImageOverlay: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 36,
    height: 36,
    zIndex: 10,
  },

  unavailableBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9,
  },
  unavailableBadgeText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },

  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    minHeight: 36,
  },
  productPresentation: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },

  addToCartButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartButtonUnavailable: { backgroundColor: "#E5E7EB" },
  addToCartText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  addToCartTextUnavailable: { color: "#6B7280" },
  addToCartButtonDisabled: { opacity: 0.7 },
});

export default ProductCard;
