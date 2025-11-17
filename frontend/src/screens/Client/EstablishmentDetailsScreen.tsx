// EstablishmentDetails.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";

import {
  getCatalogProducts2,
  Product as ApiProduct,
} from "../../services/establishment/catalogService";

import { CartService } from "../../services/client/CartService";
import { TarjaImages } from "../../utils/tarja";
import Header from "../../components/common/Header";

import ProductImageWithOverlay from "../../components/common/ProductImage";

const { width: screenWidth } = Dimensions.get("window");

type EstablishmentDetailsRouteParams = {
  storeId: string;
  storeName: string;
  storeDistance: string;
  storeDeliveryTime: string;
  storeData: {
    id: string;
    nome: string;
    distance: string;
    deliveryTime: string;
  };
};

type EstablishmentDetailsRouteProp = RouteProp<
  { EstablishmentDetails: EstablishmentDetailsRouteParams },
  "EstablishmentDetails"
>;

type Product = {
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

type Category = {
  id: string;
  name: string;
  products: Product[];
};

const EstablishmentDetails: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const route = useRoute<EstablishmentDetailsRouteProp>();

  const { storeId, storeName, storeDistance, storeDeliveryTime } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [buyAgainProducts, setBuyAgainProducts] = useState<Product[]>([]);

  const navigateToCategory = (categoryName: string, categoryId: string) => {
    console.log(`Navegando para categoria: ${categoryName}`);
    alert(`Navegando para: ${categoryName}`);
  };

  const navigateToProduct = (product: Product) => {
    console.log("=== NAVIGATE TO PRODUCT ===");
    console.log("Produto completo:", product);
    console.log("ID:", product.id);
    console.log("Nome:", product.name);

    if (!product || !product.id) {
      console.error("❌ ERRO CRÍTICO: Produto ou ID inválido:", product);
      alert("Erro: Produto não encontrado");
      return;
    }

    console.log(
      "✅ Navegando para produto válido:",
      product.name,
      "ID:",
      product.id
    );

    navigation.navigate("ProductDetails", {
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        apresentacao: product.apresentacao,
        detentor_registro: product.detentor_registro,
        registro_anvisa: product.registro_anvisa,
        substancia_ativa: product.substancia_ativa,
        link_bula: product.link_bula,
        disponibilidade: product.disponibilidade,
      },
      storeId: storeId,
      storeName: storeName,
    });
  };
  // Navegação de volta
  const goBack = () => {
    navigation.goBack();
  };

  // Navegacao Carrinho
  const navigateToCart = () => {
    navigation.navigate("Cart");
  };

  // Navegação de Search
  const navigateToSearch = () => {
    navigation.navigate("Search");
  };

  // Adicionar ao carrinho
  const addToCart = async (productId: string, productName: string) => {
    if (isAddingToCart) return; 

    setIsAddingToCart(true);
    console.log(
      `🚀 Tentando adicionar ao carrinho: ${productName} (ID: ${productId})`
    );

    try {
      await CartService.addItem(productId, 1);

      Alert.alert("Sucesso", `${productName} adicionado ao carrinho!`);

    } catch (e) {
      console.error("❌ Erro ao adicionar ao carrinho:", e);
      Alert.alert(
        "Erro",
        "Não foi possível adicionar o item ao carrinho. So e permitido adicionar itens de um mesmo estabelecimento."
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  const groupProductsByCategory = (products: ApiProduct[]): Category[] => {
    const grouped = products.reduce((acc, apiProduct) => {
      console.log("=== DEBUG MAPPING PRODUCT ===");
      console.log("API Product:", apiProduct);
      console.log("idcatalogo_produto:", apiProduct.idcatalogo_produto);
      console.log("Tipo:", typeof apiProduct.idcatalogo_produto);

      const product: Product = {
        id: apiProduct.idcatalogo_produto.toString(),
        name: apiProduct.produto.nome_comercial, 
        price: formatPrice(apiProduct.valor_venda), 
        category: apiProduct.produto.classe_terapeutica || "Outros",

        nome_comercial: apiProduct.produto.nome_comercial,
        classe_terapeutica: apiProduct.produto.classe_terapeutica,
        detentor_registro: apiProduct.produto.detentor_registro,
        registro_anvisa: apiProduct.produto.registro_anvisa,
        valor_venda: apiProduct.valor_venda,
        preco_cmed: apiProduct.produto.preco_cmed,
        substancia_ativa: apiProduct.produto.substancia_ativa,
        disponibilidade: apiProduct.disponibilidade,
        link_bula: apiProduct.produto.link_bula,
        apresentacao: apiProduct.produto.apresentacao || "",
        tarja: apiProduct.produto.tarja || "Sem Tarja",
        tipo_produto: apiProduct.produto.tipo_produto,
      };

      const categoryName =
        apiProduct.produto.classe_terapeutica || "Outros Produtos";
      const categoryId = categoryName.toLowerCase().replace(/\s/g, "-");

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: categoryName,
          products: [],
        };
      }

      acc[categoryId].products.push(product);
      return acc;
    }, {} as Record<string, Category>);

    Object.values(grouped).forEach((category) => {
      category.products.sort((a, b) => {
        if (a.disponibilidade && !b.disponibilidade) return -1;
        if (!a.disponibilidade && b.disponibilidade) return 1;
        return 0; 
      });
    });

    return Object.values(grouped);
  };

  const fetchProducts = useCallback(async (id: string) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const apiProducts = await getCatalogProducts2(id);

      const sortedApiProducts = [...apiProducts].sort((a, b) => {
        if (a.disponibilidade && !b.disponibilidade) return -1;
        if (!a.disponibilidade && b.disponibilidade) return 1;
        return 0;
      });

      const buyAgainProducts = sortedApiProducts
        .slice(0, 3)
        .map((apiProduct) => ({
          id: apiProduct.idcatalogo_produto.toString(),
          name: apiProduct.produto.nome_comercial,
          price: formatPrice(apiProduct.valor_venda),
          category: "buy-again",
          nome_comercial: apiProduct.produto.nome_comercial,
          classe_terapeutica: apiProduct.produto.classe_terapeutica,
          detentor_registro: apiProduct.produto.detentor_registro,
          registro_anvisa: apiProduct.produto.registro_anvisa,
          valor_venda: apiProduct.valor_venda,
          preco_cmed: apiProduct.produto.preco_cmed,
          substancia_ativa: apiProduct.produto.substancia_ativa,
          disponibilidade: apiProduct.disponibilidade,
          link_bula: apiProduct.produto.link_bula,
          apresentacao: apiProduct.produto.apresentacao || "",
          tarja: apiProduct.produto.tarja || "",
          tipo_produto: apiProduct.produto.tipo_produto || "",
        }));

      const buyAgainCategory: Category = {
        id: "buy-again",
        name: "Comprar Novamente",
        products: buyAgainProducts,
      };

      const groupedCategories = groupProductsByCategory(apiProducts);

      setCategories([buyAgainCategory, ...groupedCategories]);
    } catch (e) {
      console.error("Falha ao buscar produtos da loja:", e);
      setError("Falha ao carregar os produtos desta loja.");
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatPrice = (value: string | number): string => {
    if (!value) return "R$ 0,00";

    const numValue =
      typeof value === "string" ? parseFloat(value.replace(",", ".")) : value;

    return `R$ ${numValue.toFixed(2).replace(".", ",")}`;
  };

  useEffect(() => {
    fetchProducts(storeId);
  }, [fetchProducts, storeId]); 


  const renderStoreInfo = () => (
    <View style={styles.storeInfoSection}>
      <View style={styles.storeAvatar}>
        <MaterialIcons name="store" size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.storeName}>{storeName}</Text>
      <Text style={styles.storeDetails}>
        {storeDistance} / {storeDeliveryTime}
      </Text>
    </View>
  );

  const renderProductCard = (
    product: Product,
    categoryId: string,
    index: number
  ) => {
    if (!product || !product.id) return null;

    const isAvailable = product.disponibilidade;

    return (
      <TouchableOpacity
        key={product.id}
        style={styles.productCard}
        onPress={() => {
          navigateToProduct(product);
        }}
      >
        <ProductImageWithOverlay
          product={product}
          style={styles.productImage}
        />

        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.productPresentation} numberOfLines={4}>
          {product.apresentacao}
        </Text>

        <Text style={styles.productPrice}>{product.price}</Text>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !isAvailable && styles.addToCartButtonUnavailable,
            isAddingToCart && styles.addToCartButtonDisabled,
          ]}
          onPress={() => {
            if (isAvailable) {
              addToCart(product.id, product.name);
            }
          }}
          disabled={!isAvailable || isAddingToCart}
        >
          <Text
            style={[
              styles.addToCartText,
              !isAvailable && styles.addToCartTextUnavailable,
            ]}
          >
            {isAvailable
              ? isAddingToCart
                ? "Adicionando..."
                : "Adicionar"
              : "Indisponível"}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderCategorySection = (category: Category) => (
    <View key={category.id} style={styles.categorySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{category.name}</Text>
        <TouchableOpacity
          onPress={() => navigateToCategory(category.name, category.id)}
        >
          <Text style={styles.seeMoreText}>Ver mais</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsScroll}
      >
        {category.products.map((product, index) =>
          renderProductCard(product, category.id, index)
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header showBackButton showSearchIcon showCartIcon />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderStoreInfo()}

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.loadingIndicator}
          />
        ) : error ? (
          <Text style={styles.errorText}>Ops! {error}</Text>
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum produto encontrado nesta loja.
          </Text>
        ) : (
          categories.map(renderCategorySection)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  storeInfoSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  storeAvatar: {
    width: 96,
    height: 96,
    backgroundColor: "#E5E7EB",
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  storeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  storeDetails: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  categorySection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    flexWrap: "wrap",
    flexShrink: 1,
  },
  seeMoreButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 2,
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
    flexShrink: 0,
  },
  productsScroll: {
    gap: 16,
    paddingRight: 16,
  },
  productCard: {
    width: 160,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 12,
    position: "relative",
    justifyContent: "space-between",
    minHeight: 280,
  },
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
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    minHeight: 40,
  },
  productPresentation: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 16,
    flex: 1,
    flexShrink: 1,
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
  addToCartButtonUnavailable: {
    backgroundColor: "#E5E7EB",
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addToCartTextUnavailable: {
    color: "#EF4444",
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#D32F2F",
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    paddingHorizontal: 20,
  },
  unavailableBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  unavailableBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
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
  addToCartButtonDisabled: {
    opacity: 0.7,
  },
});

export default EstablishmentDetails;
