// components/stores/CategorySection.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import ProductCard from "../common/ProductCard";
import { Produto } from "../../types";
export type Category = {
  id: string;
  nome: string; // Nome da classe terapêutica
  produtos: Produto[];
};

interface CategorySectionProps {
  category: Category;
  onProductPress: (productId: number, productName: string) => void;
  onAddToCart: (productId: string, productName: string) => void;
  onSeeMorePress: (categoryName: string, categoryId: string) => void;
  showSeeMore?: boolean;
  showAddToCart?: boolean;
  horizontal?: boolean;
  numColumns?: number;
  maxProducts?: number; // Limite de produtos para mostrar
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  onProductPress,
  onAddToCart,
  onSeeMorePress,
  showSeeMore = true,
  showAddToCart = true,
  horizontal = true,
  numColumns = 2,
  maxProducts,
}) => {
  // Limita o número de produtos se maxProducts for definido
  const productsToShow = maxProducts
    ? category.produtos.slice(0, maxProducts)
    : category.produtos;

  if (horizontal) {
    return (
      <View style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{category.nome}</Text>
          {showSeeMore && category.produtos.length > 0 && (
            <TouchableOpacity
              onPress={() => onSeeMorePress(category.nome, category.id)}
            >
              <Text style={styles.seeMoreText}>
                Ver todos ({category.produtos.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {productsToShow.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScroll}
          >
            {productsToShow.map((product) => (
              <ProductCard
                // 🛑 USE O ID ÚNICO DO CATÁLOGO PRODUTO
                key={product.idcatalogo_produto}
                product={product}
                categoryId={category.id}
                // ... props
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyCategory}>
            <Text style={styles.emptyCategoryText}>
              Nenhum produto disponível nesta categoria
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Layout em grid para quando não for horizontal
  return (
    <View style={styles.categorySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{category.nome}</Text>
        {showSeeMore && category.produtos.length > 0 && (
          <TouchableOpacity
            onPress={() => onSeeMorePress(category.nome, category.id)}
          >
            <Text style={styles.seeMoreText}>
              Ver todos ({category.produtos.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {productsToShow.length > 0 ? (
        <View
          style={[
            styles.productsGrid,
            { flexDirection: "row", flexWrap: "wrap" },
          ]}
        >
          {productsToShow.map((product) => (
            <View
              key={`${product.idproduto}-${product.idcatalogo_produto}`}
              style={{ width: `${100 / numColumns}%`, padding: 8 }}
            >
              <ProductCard
                product={product}
                categoryId={category.id}
                onPress={onProductPress}
                onAddToCart={onAddToCart}
                showAddToCart={showAddToCart}
                cardWidth={undefined} // Deixa o width ser controlado pelo container
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCategory}>
          <Text style={styles.emptyCategoryText}>
            Nenhum produto disponível nesta categoria
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categorySection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
    marginLeft: 12,
  },
  productsScroll: {
    gap: 16,
    paddingRight: 16,
  },
  productsGrid: {
    gap: 16,
  },
  emptyCategory: {
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    alignItems: "center",
  },
  emptyCategoryText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default CategorySection;
