import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator, // 🚨 Adicionado para o Loading
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import {
  CartDetails,
  CartService,
  CartItem,
} from "../../services/client/CartService"; // Incluída CartItemDetails
// 🚨 Importação do PedidoService (Ajuste conforme o nome do seu arquivo)
import { PedidoService } from "../../services/client/PedidoService";
import Header from "../../components/common/Header";

const { width: screenWidth } = Dimensions.get("window");

type OrderSummaryProps = {
  navigation: any;
};

// Tipo para os parâmetros recebidos via navegação
type RouteParams = {
  selectedAddress: any; // O endereço completo selecionado
  selectedPaymentMethod: "local" | "card" | "wallet" | "pix";
};

// 🚨 MANTIDA A FUNÇÃO DE CONVERSÃO FORA DO COMPONENTE
const getPaymentMethodId = (method: string): number => {
  switch (method) {
    case "card":
      return 1; // ID do Cartão na sua tabela FormaPagamento
    case "pix":
      return 2; // ID do Pix na sua tabela FormaPagamento
    case "local":
      return 3; // ID do Pagamento na entrega na sua tabela FormaPagamento
    default:
      return 1;
  }
};

const OrderSummary: React.FC<OrderSummaryProps> = ({ navigation }) => {
  const [cartDetails, setCartDetails] = useState<CartDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const route = useRoute();
  const { selectedAddress, selectedPaymentMethod } =
    route.params as RouteParams;

  // FUNÇÃO DE CARREGAMENTO DE DADOS DA API
  useEffect(() => {
    const loadCartDetails = async () => {
      if (!selectedAddress || !selectedPaymentMethod) {
        Alert.alert(
          "Erro",
          "Faltando dados de endereço ou pagamento. Retornando ao carrinho."
        );
        navigation.goBack();
        return;
      }

      try {
        setIsLoading(true);
        const details = await CartService.getCartDetails();

        if (!details || details.items.length === 0) {
          Alert.alert(
            "Carrinho Vazio",
            "O carrinho está vazio ou os dados são inválidos."
          );
          navigation.goBack();
          return;
        }
        setCartDetails(details);
      } catch (error) {
        console.error(
          "Erro ao carregar detalhes do carrinho para resumo:",
          error
        );
        Alert.alert(
          "Erro",
          "Não foi possível carregar os detalhes finais do pedido."
        );
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    loadCartDetails();
  }, []);

  // Formatar preço
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  // 🚨 FUNÇÃO CONFIRMORDER CORRIGIDA E SEM REPETIÇÃO
  const confirmOrder = async () => {
    if (!cartDetails || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // ⚠️ O ID do endereço deve ser o ID que o seu backend espera (selectedAddress.id)
      const addressId = selectedAddress.addressData?.idendereco_cliente;
      const paymentId = getPaymentMethodId(selectedPaymentMethod);

      if (!addressId || !paymentId) {
        throw new Error("ID do endereço ou pagamento inválido.");
      }

      // Chama o serviço de criação de pedido com os DADOS CORRIGIDOS (tipagem do backend)
      const pedidoCriado = await PedidoService.createOrderFromCart({
        idcarrinho: cartDetails.idcarrinho,
        // Nomes que o Sequelize espera:
        endereco_cliente_idendereco_cliente: addressId,
        forma_pagamento_idforma_pagamento: paymentId,

        // Campos auxiliares
        forma_pagamento_string: selectedPaymentMethod,
        observacoes: "",
      });

      Alert.alert(
        "Sucesso!",
        `Pedido #${pedidoCriado.idpedido} realizado com sucesso!`
      );
      navigation.navigate("OrderFeed", { orderConfirmed: true });
    } catch (error: any) {
      console.error("Erro ao fechar pedido:", error);
      Alert.alert(
        "Erro no Checkout",
        error.message || "Falha ao finalizar o pedido. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Voltar
  const goBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    // ... (Sem mudanças)
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack} style={styles.backButton}>
        <MaterialIcons name="arrow-back-ios" size={24} color="#007AFF" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Resumo do Pedido</Text>

      <View style={styles.headerSpacer} />
    </View>
  );

  // Função de renderização para itens
  const renderProductItem = (product: CartItem) => (
    <View key={product.id} style={styles.productItem}>
      <View style={styles.productImage}>
        <MaterialIcons name="image" size={36} color="#6C6C70" />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDetails}>{product.details}</Text>
        <Text style={styles.productQuantity}>
          Quantidade: {product.quantity}
        </Text>
      </View>

      <Text style={styles.productPrice}>
        {formatPrice(product.price * product.quantity)}
      </Text>
    </View>
  );

  const renderStoreInfo = () => (
    <View style={styles.storeCard}>
      <View style={styles.storeIcon}>
        <MaterialIcons name="store" size={24} color="#007AFF" />
      </View>
      <Text style={styles.storeName}>
        {cartDetails?.estabelecimento.name || "Carregando..."}
      </Text>
    </View>
  );

  const renderProductsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Produtos</Text>
      <View style={styles.productsList}>
        {cartDetails?.items.map(renderProductItem)}
      </View>
    </View>
  );

  const renderPaymentSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
      <View style={styles.paymentCard}>
        <Text style={styles.paymentType}>
          {selectedPaymentMethod === "local"
            ? "Pagamento na entrega"
            : selectedPaymentMethod}
        </Text>
        <Text style={styles.paymentDigits}>
          {selectedPaymentMethod === "local"
            ? "Dinheiro/Cartão na entrega"
            : "Detalhes do Cartão (Não implementado)"}
        </Text>
      </View>
    </View>
  );

  const renderAddressSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
      <View style={styles.addressCard}>
        <MaterialIcons
          name="location-on"
          size={24}
          color="#1C1C1E"
          style={styles.addressIcon}
        />
        <View style={styles.addressInfo}>
          <Text style={styles.addressTitle}>{selectedAddress.title}</Text>
          <Text style={styles.addressDetails}>{selectedAddress.address}</Text>
          {selectedAddress.details ? (
            <Text style={styles.addressDetails}>{selectedAddress.details}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  const renderPrescriptionsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Receitas anexadas</Text>
      <View style={styles.prescriptionsContainer}>
        <View style={styles.prescriptionCard}>
          <MaterialIcons name="image" size={36} color="#6C6C70" />
        </View>
        <View style={styles.prescriptionCard}>
          <MaterialIcons name="image" size={36} color="#6C6C70" />
        </View>
      </View>
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.summarySection}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>
          {formatPrice(cartDetails?.subtotal || 0)}
        </Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Taxa de entrega</Text>
        <Text style={styles.summaryValue}>
          {formatPrice(cartDetails?.deliveryFee || 0)}
        </Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {formatPrice(cartDetails?.total || 0)}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {renderOrderSummary()}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          isSubmitting && styles.confirmButtonDisabled,
        ]}
        onPress={confirmOrder}
        disabled={isSubmitting || !cartDetails}
      >
        <Text style={styles.confirmButtonText}>
          {isSubmitting ? "Finalizando Pedido..." : "Confirmar Pedido"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Renderização de Loading
  if (isLoading || !cartDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Resumo do Pedido" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            Buscando resumo final do pedido...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Resumo do Pedido" showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStoreInfo()}
        {renderProductsSection()}
        {renderPaymentSection()}
        {renderAddressSection()}
        {renderPrescriptionsSection()}
      </ScrollView>

      {renderFooter()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (Seus estilos originais)
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F8F8F8",
  },
  backButton: {
    padding: 4,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  storeIcon: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 12,
    marginRight: 16,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  productsList: {
    gap: 16,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  productDetails: {
    fontSize: 14,
    color: "#6C6C70",
  },
  productQuantity: {
    fontSize: 14,
    color: "#6C6C70",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  paymentCard: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  paymentDigits: {
    fontSize: 14,
    color: "#6C6C70",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
  },
  addressIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressInfo: {
    flex: 1,
    gap: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  addressDetails: {
    fontSize: 14,
    color: "#6C6C70",
  },
  prescriptionsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  prescriptionCard: {
    width: 96,
    height: 96,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    backgroundColor: "#F8F8F8",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  summarySection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6C6C70",
  },
  summaryValue: {
    fontSize: 16,
    color: "#1C1C1E",
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6C6C70",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#9CA3AF",
  },
});

export default OrderSummary;
