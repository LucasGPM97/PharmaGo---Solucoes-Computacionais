import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import Header from "../../components/common/Header";
import ProductImageWithOverlay from "../../components/common/ProductImage";
import {
  getProductById,
  Product as ApiProduct,
} from "../../services/establishment/catalogService";
import { CartService } from "../../services/client/CartService";

const { width: screenWidth } = Dimensions.get("window");

type ProductDetailRouteParams = {
  product: {
    id: string;
    name: string;
    price: string;
    apresentacao: string;
    detentor_registro: string;
    registro_anvisa: string;
    substancia_ativa: string;
    link_bula: string;
    disponibilidade: boolean;
    tarja: string;
    tipo_produto: string;
  };
  storeId: string;
  storeName: string;
};

type ProductDetailRouteProp = RouteProp<
  { ProductDetail: ProductDetailRouteParams },
  "ProductDetail"
>;

const ProductDetail: React.FC<{ navigation: any }> = ({ navigation }) => {
  const route = useRoute<ProductDetailRouteProp>();
  const { product: productFromParams, storeId, storeName } = route.params;

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false); 
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);

        const productData = await getProductById(productFromParams.id);
        setProduct(productData);
      } catch (err) {
        console.error("Erro ao buscar detalhes do produto:", err);
        setError("Erro ao carregar detalhes do produto");

        setProduct({
          idcatalogoProduto: productFromParams.id,
          nome: productFromParams.name,
          nome_comercial: productFromParams.name,
          valor_venda_display: productFromParams.price,
          apresentacao: productFromParams.apresentacao,
          detentor_registro: productFromParams.detentor_registro,
          registro_anvisa: productFromParams.registro_anvisa,
          substancia_ativa: productFromParams.substancia_ativa,
          link_bula: productFromParams.link_bula,
          disponibilidade: productFromParams.disponibilidade,
          classe_terapeutica: "",
          preco_cmed: "",
          valor_venda_numerico: 0,
          isExpanded: false,
          isEditing: false,
          tarja: productFromParams.tarja,
          tipo_produto: productFromParams.tipo_produto,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productFromParams]);
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const addToCart = async () => {
    if (!product || !product.disponibilidade || isAdding) return;

    const idcatalogoProduto = product.idcatalogoProduto;

    if (!idcatalogoProduto) {
      alert("Erro: ID do produto não encontrado.");
      return;
    }

    setIsAdding(true);

    try {
      await CartService.addItem(idcatalogoProduto, quantity);

      alert(
        `${quantity} ${product.nome || product.name} adicionado(s) ao carrinho!`
      );
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      alert("❌ Erro ao adicionar ao carrinho. Tente novamente.");
    } finally {
      setIsAdding(false);
    }
  };

  const openLeaflet = () => {
    if (!product?.link_bula) {
      alert("Link da bula não disponível");
      return;
    }
    console.log("Abrindo bula:", product.link_bula);
    alert(`Abrindo bula: ${product.link_bula}`);
    Linking.openURL(product.link_bula);
  };

  const AccordionItem: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View style={styles.accordionContainer}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => setIsOpen(!isOpen)}
          activeOpacity={0.7}
        >
          <Text style={styles.accordionTitle}>{title}</Text>
          <MaterialIcons
            name={isOpen ? "expand-less" : "expand-more"}
            size={24}
            color="#6C6C70"
          />
        </TouchableOpacity>

        {isOpen && <View style={styles.accordionContent}>{children}</View>}
      </View>
    );
  };

  const renderProductImage = () => {
    if (!product) {
      return (
        <View style={styles.productImage}>
          <MaterialIcons name="image" size={64} color="#9CA3AF" />
        </View>
      );
    }

    const productForImage = {
      id: product.idcatalogoProduto || product.id,
      nome_comercial: product.nome_comercial || product.nome || product.name,
      apresentacao: product.apresentacao,
      substancia_ativa: product.substancia_ativa,
      tarja: product.tarja,
      tipo_produto: product.tipo_produto,
      disponibilidade: product.disponibilidade,
    };

    return (
      <View style={styles.productImageContainer}>
        <ProductImageWithOverlay
          product={productForImage}
          style={styles.productImageStyle}
          imageStyle={styles.productImageInner}
        />
      </View>
    );
  };

  const renderProductTitle = () => (
    <View style={styles.titleSection}>
      <Text style={styles.productName}>
        {product?.nome || product?.name || "Produto"}
      </Text>
      <Text style={styles.productDescription}>
        {product?.substancia_ativa || "Medicamento"}
      </Text>
      <Text style={styles.productDescription}>
        {product?.apresentacao || "Medicamento"}
      </Text>
    </View>
  );

  const renderPriceAndQuantity = () => (
    <View style={styles.priceQuantitySection}>
      <View style={styles.priceInfo}>
        <Text style={styles.priceLabel}>Preço</Text>
        <Text style={styles.productPrice}>
          {product?.valor_venda_display || product?.price || "R$ 0,00"}
        </Text>
      </View>

      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={[
            styles.quantityButton,
            quantity === 1 && styles.quantityButtonDisabled,
          ]}
          onPress={decreaseQuantity}
          disabled={quantity === 1}
        >
          <MaterialIcons
            name="remove"
            size={24}
            color={quantity === 1 ? "#9CA3AF" : "#6C6C70"}
          />
        </TouchableOpacity>

        <Text style={styles.quantityValue}>{quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButtonPrimary}
          onPress={increaseQuantity}
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTarjaWarning = () => {
    if (!product?.tarja && !product?.requer_receita) return null;

    let warningText = "";
    let warningStyle = styles.warningInfo;

    if (product.tarja) {
      const tarjaLower = product.tarja.toLowerCase();

      if (tarjaLower.includes("preta")) {
        warningText =
          "Venda sob prescrição médica. É um medicamento de controle especial.";
        warningStyle = styles.warningPreta;
      } else if (
        tarjaLower.includes("vermelha") &&
        tarjaLower.includes("restrição")
      ) {
        warningText =
          "Venda sob prescrição médica. Só pode ser vendido com retenção da receita.";
        warningStyle = styles.warningVermelhaRestricao;
      } else if (tarjaLower.includes("vermelha")) {
        warningText = "Venda sob prescrição médica.";
        warningStyle = styles.warningVermelha;
      } else if (tarjaLower.includes("amarela")) {
        warningText = "Medicamento de tarja amarela.";
        warningStyle = styles.warningAmarela;
      } else {
        warningText = `Tarja: ${product.tarja}`;
        warningStyle = styles.warningInfo;
      }
    } else if (product.requer_receita) {
      warningText = "Venda sob prescrição médica.";
      warningStyle = styles.warningVermelha;
    }

    return (
      <View style={[styles.warningSection, warningStyle]}>
        <Text style={styles.warningText}>{warningText}</Text>
      </View>
    );
  };

  const renderTipoProdutoWarning = () => {
    if (!product?.tipo_produto) return null;

    let warningText = "";
    const tipoLower = product.tipo_produto.toLowerCase();

    if (tipoLower.includes("genérico")) {
      warningText = "Medicamento Genérico – Lei N.º 9.787/99.";
    } else if (tipoLower.includes("similar")) {
      warningText = "Medicamento Similar.";
    } else if (
      tipoLower.includes("referência") ||
      tipoLower.includes("referencia")
    ) {
      warningText = "Medicamento de Referência.";
    } else if (tipoLower.includes("novo")) {
      warningText = "Medicamento Novo.";
    } else {
      warningText = `Medicamento ${product.tipo_produto}.`;
    }

    return (
      <View style={[styles.warningSection, styles.warningGenerico]}>
        <Text style={styles.warningText}>{warningText}</Text>
      </View>
    );
  };

  const renderWarning = () => {
    if (!product) return null;

    return (
      <View style={styles.warningsContainer}>
        <View style={[styles.warningSection, styles.warningPrincipal]}>
          <Text style={styles.warningText}>
            {product.nome || product.name} É UM MEDICAMENTO. {"\n"}SEU USO PODE
            TRAZER RISCOS.{"\n"}PROCURE UM MÉDICO OU UM FARMACÊUTICO. {"\n"}LEIA
            A BULA.{"\n"}MEDICAMENTOS PODEM CAUSAR EFEITOS INDESEJADOS. {"\n"}
            EVITE A AUTOMEDICAÇÃO: INFORME-SE COM O FARMACÊUTICO.
          </Text>
        </View>

        {renderTarjaWarning()}

        {renderTipoProdutoWarning()}
      </View>
    );
  };

  const renderAccordions = () => (
    <View style={styles.accordionsSection}>
      <AccordionItem title="Descrição do produto">
        <Text style={styles.accordionText}>
          {product?.substancia_ativa
            ? `${product.nome || product.name} é um medicamento à base de ${
                product.substancia_ativa
              }.`
            : "Descrição do produto não disponível."}
        </Text>
      </AccordionItem>

      <AccordionItem title="Características">
        <View style={styles.characteristicsList}>
          <View style={styles.characteristicItem}>
            <Text style={styles.characteristicLabel}>Apresentação</Text>
            <Text style={styles.characteristicValue}>
              {product?.apresentacao || "Não informado"}
            </Text>
          </View>

          <View style={styles.characteristicItem}>
            <Text style={styles.characteristicLabel}>
              Número de registro na Anvisa
            </Text>
            <Text style={styles.characteristicValue}>
              {product?.registro_anvisa || "Não informado"}
            </Text>
          </View>

          <View style={styles.characteristicItem}>
            <Text style={styles.characteristicLabel}>
              Nome do detentor do registro
            </Text>
            <Text style={styles.characteristicValue}>
              {product?.detentor_registro || "Não informado"}
            </Text>
          </View>

          <View style={styles.characteristicItem}>
            <Text style={styles.characteristicLabel}>Substância Ativa</Text>
            <Text style={styles.characteristicValue}>
              {product?.substancia_ativa || "Não informado"}
            </Text>
          </View>
        </View>
      </AccordionItem>

      <TouchableOpacity style={styles.leafletCard} onPress={openLeaflet}>
        <Text style={styles.leafletText}>Link para a bula</Text>
        <MaterialIcons name="open-in-new" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderAddToCartButton = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[
          styles.addToCartButton,
          (!product?.disponibilidade || isAdding) &&
            styles.addToCartButtonDisabled, 
        ]}
        onPress={addToCart}
        disabled={!product?.disponibilidade || isAdding} 
      >
        {isAdding ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <MaterialIcons
            name={product?.disponibilidade ? "add-shopping-cart" : "block"}
            size={24}
            color="#FFFFFF"
          />
        )}

        <Text style={styles.addToCartText}>
          {isAdding
            ? "Adicionando..."
            : product?.disponibilidade
            ? "Adicionar ao carrinho"
            : "Indisponível"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title="Detalhes do Produto" showBackButton showCartIcon />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando produto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header title="Detalhes do Produto" showBackButton showCartIcon />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="Detalhes do Produto" showBackButton showCartIcon />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderProductImage()}
        {renderProductTitle()}
        {renderPriceAndQuantity()}
        {renderWarning()}
        {renderAccordions()}
      </ScrollView>

      {renderAddToCartButton()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6C6C70",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  productImage: {
    height: 256,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    margin: 16,
    borderRadius: 16,
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  productDescription: {
    fontSize: 16,
    color: "#6C6C70",
    marginTop: 4,
  },
  priceQuantitySection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: "#6C6C70",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonPrimary: {
    width: 40,
    height: 40,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    width: 32,
    textAlign: "center",
  },
  accordionsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 8,
  },
  accordionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  accordionText: {
    fontSize: 14,
    color: "#6C6C70",
    lineHeight: 20,
  },
  characteristicsList: {
    gap: 16,
  },
  characteristicItem: {
    gap: 4,
  },
  characteristicLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  characteristicValue: {
    fontSize: 14,
    color: "#6C6C70",
  },
  leafletCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leafletText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  footer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    padding: 16,
  },
  addToCartButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  addToCartButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  warningsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 8, 
  },
  warningSection: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  warningText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  warningPrincipal: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderLeftColor: "#FFC107",
  },
  warningPreta: {
    backgroundColor: "rgba(33, 33, 33, 0.1)",
    borderLeftColor: "#212121",
  },
  warningVermelhaRestricao: {
    backgroundColor: "rgba(198, 40, 40, 0.1)",
    borderLeftColor: "#C62828",
  },
  warningVermelha: {
    backgroundColor: "rgba(229, 57, 53, 0.1)",
    borderLeftColor: "#E53935",
  },
  warningAmarela: {
    backgroundColor: "rgba(255, 160, 0, 0.1)",
    borderLeftColor: "#FFA000",
  },
  warningGenerico: {
    backgroundColor: "rgba(97, 97, 97, 0.1)",
    borderLeftColor: "#616161",
  },
  warningInfo: {
    backgroundColor: "rgba(21, 101, 192, 0.1)",
    borderLeftColor: "#1565C0",
  },
  productImageContainer: {
    height: 256,
    backgroundColor: "#F3F4F6",
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  productImageStyle: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },
  productImageInner: {
    width: "100%",
    height: "100%",
  },
});

export default ProductDetail;
