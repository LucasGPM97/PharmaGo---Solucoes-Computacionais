// components/products/ProductImageWithOverlay.tsx (Crie este componente)
import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { getProductImageSource, Product } from "../../utils/tarjaImagem"; // 👈 Importa a nova função

interface ProductImageWithOverlayProps {
  product: Product;
  style?: object;
  imageStyle?: object;
}

const ProductImageWithOverlay: React.FC<ProductImageWithOverlayProps> = ({
  product,
  style,
  imageStyle,
}) => {
  const { source, isUsingPlaceholder } = getProductImageSource(product);
  const isAvailable = product.disponibilidade;

  return (
    <View style={[styles.productImage, style]}>
      {/* IMAGEM PRINCIPAL: Tarja Combinada ou Placeholder */}
      <Image
        source={source}
        style={[styles.productMainImage, imageStyle]}
        resizeMode={"cover"}
      />

      {/* OVERLAY DE INDISPONÍVEL */}
      {!isAvailable && (
        <View style={styles.unavailableImageOverlay}>
          <Text style={styles.unavailableBadgeText}>INDISPONÍVEL</Text>
        </View>
      )}
    </View>
  );
};

// Estilos específicos para a imagem e overlay
const styles = StyleSheet.create({
  productImage: {
    width: "100%",
    height: 96,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
  },
  productMainImage: {
    width: "100%",
    height: "100%",
  },
  unavailableImageOverlay: {
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
  unavailableBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default ProductImageWithOverlay;
