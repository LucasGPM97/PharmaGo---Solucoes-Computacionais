import React, { useEffect, useState } from "react";
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import {
  getOrderDetailsById,
  OrderDetail,
} from "../../services/client/PedidoService";
import ProductImageWithOverlay from "../../components/common/ProductImage";

const { width: screenWidth } = Dimensions.get("window");

type OrderStatus =
  | "Aguardando Pagamento"
  | "Em Separação"
  | "Em Rota"
  | "Entregue"
  | "Cancelado";

type OrderDetailsProps = {
  navigation: any;
  route: {
    params: {
      orderId: string;
    };
  };
};

const OrderDetails: React.FC<OrderDetailsProps> = ({ navigation, route }) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = route.params.orderId;

  const [expandedSections, setExpandedSections] = useState({
    products: true,
    summary: true,
    payment: false,
    address: false,
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!orderId) {
        setError("ID do pedido ausente.");
        setLoading(false);
        return;
      }
      console.log(`[DEBUG] Buscando pedido ID: ${orderId}`);
      try {
        const details = await getOrderDetailsById(orderId);

        console.log("[DEBUG] Dados recebidos:", details);
        console.log("[DEBUG] Itens do pedido:", details.pedido_itens);
        console.log(
          "[DEBUG] Primeiro item completo:",
          details.pedido_itens?.[0]
        );
        console.log(
          "[DEBUG] Estrutura do produto:",
          details.pedido_itens?.[0]?.catalogo_produto
        );

        const primeiroProduto =
          details.pedido_itens?.[0]?.catalogo_produto?.produto;
        console.log(
          "[DEBUG] Propriedades do produto:",
          Object.keys(primeiroProduto || {})
        );
        console.log("[DEBUG] nome_comercial:", primeiroProduto?.nome_comercial);
        console.log("[DEBUG] apresentacao:", primeiroProduto?.apresentacao);
        console.log(
          "[DEBUG] substancia_ativa:",
          primeiroProduto?.substancia_ativa
        );

        setOrder(details);
      } catch (e: any) {
        console.error("Erro detalhado ao carregar pedido:", {
          message: e.message,
          status: e.response?.status,
          data: e.response?.data,
        });
        setError("Não foi possível carregar os detalhes do pedido.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [orderId]);

  // Função para fazer ligação
  const handleCallEstablishment = async () => {
    if (!order?.estabelecimento?.telefone_contato) {
      Alert.alert("Informação", "Telefone do estabelecimento não disponível.");

      return;
    }

    const phoneNumber = order.estabelecimento.telefone_contato;
    console.log(order?.estabelecimento?.telefone_contato);

    // Remove caracteres não numéricos
    const cleanPhone = phoneNumber.replace(/\D/g, "");

    // Verifica se o número tem o código do país (55 para Brasil)
    const formattedPhone = cleanPhone.startsWith("55")
      ? cleanPhone
      : `55${cleanPhone}`;

    const phoneUrl = `tel:${formattedPhone}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);

      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert("Erro", "Não é possível fazer ligações neste dispositivo.");
      }
    } catch (error) {
      console.error("Erro ao abrir app de ligação:", error);
      Alert.alert("Erro", "Não foi possível completar a ligação.");
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "Não disponível";

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length === 11) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(
        2,
        7
      )}-${cleanPhone.slice(7)}`;
    } else if (cleanPhone.length === 10) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(
        2,
        6
      )}-${cleanPhone.slice(6)}`;
    }

    return phone;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10 }}>Carregando detalhes do pedido...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Pedido não encontrado.</Text>
      </View>
    );
  }

  const subtotal =
    order?.pedido_itens?.reduce((sum, item) => {
      const valorUnitario = parseFloat(item.valor_unitario_venda) || 0;
      const quantidade = item.quantidade || 0;
      return sum + valorUnitario * quantidade;
    }, 0) || 0;

  const deliveryFee = (order.valor_total || 0) - subtotal;

  const formatPrice = (price: any): string => {
    if (price === undefined || price === null) {
      return "R$ 0,00";
    }

    const priceNumber =
      typeof price === "string"
        ? parseFloat(price.replace(",", "."))
        : Number(price);

    if (isNaN(priceNumber)) {
      console.warn("[DEBUG] Price is NaN:", price);
      return "R$ 0,00";
    }

    return `R$ ${priceNumber.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderOrderHeader = () => (
    <View style={styles.orderHeader}>
      <View style={styles.storeInfo}>
        <View style={styles.storeIcon}>
          <MaterialIcons name="store" size={24} color="#2563EB" />
        </View>
        <View style={styles.storeDetails}>
          <Text style={styles.storeName}>
            {order.estabelecimento?.razao_social ||
              order.estabelecimento?.nome ||
              "Estabelecimento"}
          </Text>
          <Text style={styles.orderInfo}>
            Pedido n° {order.idpedido} -{" "}
            {new Date(order.data_pedido).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderExpandableSection = (
    title: string,
    isExpanded: boolean,
    onPress: () => void,
    content?: React.ReactNode
  ) => (
    <View style={styles.expandableSection}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onPress}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <MaterialIcons
          name={isExpanded ? "expand-less" : "expand-more"}
          size={24}
          color="#64748B"
        />
      </TouchableOpacity>

      {isExpanded && content && (
        <View style={styles.sectionContent}>{content}</View>
      )}
    </View>
  );

  const renderProductsContent = () => (
    <View style={styles.productsContent}>
      {order.pedido_itens.map((item) => {
        const valorUnitario = parseFloat(item.valor_unitario_venda) || 0;
        const precoTotal = valorUnitario * (item.quantidade || 0);

        const product = {
          id: item.catalogo_produto?.produto?.idproduto,
          nome_comercial: item.catalogo_produto?.produto?.nome_comercial,
          apresentacao: item.catalogo_produto?.produto?.apresentacao,
          substancia_ativa: item.catalogo_produto?.produto?.substancia_ativa,
          tarja: item.catalogo_produto?.produto?.tarja,
          disponibilidade: item.catalogo_produto?.disponibilidade,
        };

        return (
          <View key={item.idpedido_item} style={styles.productItem}>
            {/* IMAGEM DO PRODUTO */}
            <View style={styles.productImageContainer}>
              <ProductImageWithOverlay
                product={product}
                style={styles.productImageStyle}
                imageStyle={styles.productImageInner}
              />
            </View>

            {/* INFORMAÇÕES DO PRODUTO */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {item.catalogo_produto?.produto?.nome_comercial ||
                  "Produto sem nome"}
              </Text>
              <Text style={styles.productDetails}>
                {item.catalogo_produto?.produto?.apresentacao ||
                  item.catalogo_produto?.produto?.substancia_ativa ||
                  "Detalhes do produto"}
              </Text>
              <Text style={styles.productQuantity}>
                Quantidade: {item.quantidade || 0}
              </Text>
            </View>

            {/* PREÇO */}
            <Text style={styles.productPrice}>{formatPrice(precoTotal)}</Text>
          </View>
        );
      })}
    </View>
  );

  const renderSummaryContent = () => (
    <View style={styles.summaryContent}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Taxa de entrega</Text>
        <Text style={styles.summaryValue}>{formatPrice(deliveryFee)}</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(order.valor_total)}</Text>
      </View>
    </View>
  );

  const renderPaymentContent = () => (
    <View style={styles.paymentContent}>
      <Text style={styles.paymentType}>
        {order.forma_pagamento?.nome || "Método Indefinido"}
      </Text>
      {order.forma_pagamento?.ultimos_digitos && (
        <Text style={styles.paymentDigits}>
          xxxx xxxx xxxx {order.forma_pagamento.ultimos_digitos}
        </Text>
      )}
    </View>
  );

  const renderAddressContent = () => (
    <View style={styles.addressContent}>
      <MaterialIcons
        name="location-on"
        size={20}
        color="#1E293B"
        style={styles.addressIcon}
      />
      <View style={styles.addressInfo}>
        <Text style={styles.addressTitle}>
          {order.endereco_cliente?.nome_endereco || "Endereço"}
        </Text>
        <Text style={styles.addressDetails}>
          {order.endereco_cliente?.logradouro && order.endereco_cliente?.numero
            ? `${order.endereco_cliente.logradouro}, ${order.endereco_cliente.numero}`
            : "Endereço não informado"}
        </Text>
        {order.endereco_cliente?.bairro && (
          <Text style={styles.addressDetails}>
            {order.endereco_cliente.bairro}
          </Text>
        )}
        {order.endereco_cliente?.cidade && order.endereco_cliente?.estado && (
          <Text style={styles.addressDetails}>
            {order.endereco_cliente.cidade} - {order.endereco_cliente.estado}
          </Text>
        )}
        {order.endereco_cliente?.cep && (
          <Text style={styles.addressDetails}>
            CEP: {order.endereco_cliente.cep}
          </Text>
        )}
      </View>
    </View>
  );

  const renderPrescriptions = () => (
    <View style={styles.prescriptionsSection}>
      <Text style={styles.prescriptionsTitle}>Receitas anexadas</Text>
      <View style={styles.prescriptionsGrid}>
        <View style={styles.prescriptionCard}>
          <MaterialIcons name="image" size={36} color="#93C5FD" />
        </View>
        <View style={styles.prescriptionCard}>
          <MaterialIcons name="image" size={36} color="#93C5FD" />
        </View>
      </View>
    </View>
  );

  const renderTracking = () => {
    const currentStatus = order.status;
    let progressWidth = "0%";
    let separacaoActive = false;
    let rotaActive = false;
    let entregueCompleted = false;
    let cancelado = false;
    let progressColor = "#2563EB";

    if (currentStatus === "Aguardando Pagamento") {
      progressWidth = "0%";
    } else if (currentStatus === "Em Separação") {
      progressWidth = "33%";
      separacaoActive = true;
    } else if (currentStatus === "Em Rota") {
      progressWidth = "66%";
      separacaoActive = true;
      rotaActive = true;
    } else if (currentStatus === "Entregue") {
      progressWidth = "100%";
      separacaoActive = true;
      rotaActive = true;
      entregueCompleted = true;
      progressColor = "#10B981";
    } else if (currentStatus === "Cancelado") {
      progressWidth = "0%";
      cancelado = true;
      progressColor = "#EF4444";
    }

    return (
      <View
        style={[
          styles.trackingContainer,
          cancelado && styles.cancelledTrackingContainer,
          entregueCompleted && styles.deliveredTrackingContainer,
        ]}
      >
        <View style={styles.trackingProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>

          <View style={styles.trackingSteps}>
            {/* Aguardando Pagamento */}
            <View style={styles.trackingStep}>
              <View
                style={[
                  styles.stepIcon,
                  cancelado
                    ? styles.stepCancelled
                    : entregueCompleted
                    ? styles.stepDelivered
                    : currentStatus !== "Aguardando Pagamento"
                    ? styles.stepCompleted
                    : styles.stepActive,
                ]}
              >
                <MaterialIcons
                  name="payment"
                  size={16}
                  color={
                    cancelado
                      ? "#FFFFFF"
                      : entregueCompleted
                      ? "#FFFFFF"
                      : currentStatus !== "Aguardando Pagamento"
                      ? "#2563EB"
                      : "#FFFFFF"
                  }
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (currentStatus !== "Aguardando Pagamento" ||
                    entregueCompleted ||
                    cancelado) &&
                    styles.stepActiveLabel,
                ]}
              >
                Pagamento
              </Text>
            </View>

            {/* Separação */}
            <View style={styles.trackingStep}>
              <View
                style={[
                  styles.stepIcon,
                  cancelado
                    ? styles.stepCancelled
                    : entregueCompleted
                    ? styles.stepDelivered
                    : separacaoActive
                    ? styles.stepActive
                    : styles.stepPending,
                ]}
              >
                <MaterialIcons
                  name="inventory"
                  size={16}
                  color={
                    cancelado
                      ? "#FFFFFF"
                      : entregueCompleted
                      ? "#FFFFFF"
                      : separacaoActive
                      ? "#FFFFFF"
                      : "#94A3B8"
                  }
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (separacaoActive || entregueCompleted || cancelado) &&
                    styles.stepActiveLabel,
                ]}
              >
                Separação
              </Text>
            </View>

            {/* Rota de Entrega */}
            <View style={styles.trackingStep}>
              <View
                style={[
                  styles.stepIcon,
                  cancelado
                    ? styles.stepCancelled
                    : entregueCompleted
                    ? styles.stepDelivered
                    : rotaActive
                    ? styles.stepActive
                    : styles.stepPending,
                ]}
              >
                <MaterialIcons
                  name="local-shipping"
                  size={16}
                  color={
                    cancelado
                      ? "#FFFFFF"
                      : entregueCompleted
                      ? "#FFFFFF"
                      : rotaActive
                      ? "#FFFFFF"
                      : "#94A3B8"
                  }
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (rotaActive || entregueCompleted || cancelado) &&
                    styles.stepActiveLabel,
                ]}
              >
                Entrega
              </Text>
            </View>

            {/* Entregue */}
            <View style={styles.trackingStep}>
              <View
                style={[
                  styles.stepIcon,
                  cancelado
                    ? styles.stepCancelled
                    : entregueCompleted
                    ? styles.stepDelivered
                    : entregueCompleted
                    ? styles.stepCompleted
                    : styles.stepPending,
                ]}
              >
                <MaterialIcons
                  name="check"
                  size={16}
                  color={
                    cancelado
                      ? "#FFFFFF"
                      : entregueCompleted
                      ? "#FFFFFF"
                      : "#94A3B8"
                  }
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (entregueCompleted || cancelado) && styles.stepActiveLabel,
                ]}
              >
                Entregue
              </Text>
            </View>
          </View>
        </View>

        {/* Status Atual */}
        <View style={styles.currentStatus}>
          <Text style={styles.currentStatusText}>
            Status atual:{" "}
            <Text
              style={[
                styles.statusHighlight,
                cancelado && { color: "#EF4444" },
                entregueCompleted && { color: "#10B981" },
              ]}
            >
              {currentStatus}
              {entregueCompleted && " ✅"}
              {cancelado && " ❌"}
            </Text>
          </Text>

          {cancelado && (
            <Text style={styles.cancelledNote}>Este pedido foi cancelado</Text>
          )}

          {entregueCompleted && (
            <View style={styles.deliveredInfo}>
              <MaterialIcons name="celebration" size={16} color="#10B981" />
              <Text style={styles.deliveredNote}>
                Pedido entregue com sucesso!
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Detalhes do Pedido" showBackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderOrderHeader()}

        <View style={styles.sectionsContainer}>
          {renderExpandableSection(
            "Produtos",
            expandedSections.products,
            () => toggleSection("products"),
            renderProductsContent()
          )}

          {renderExpandableSection(
            "Resumo do Pedido",
            expandedSections.summary,
            () => toggleSection("summary"),
            renderSummaryContent()
          )}

          {renderExpandableSection(
            "Forma de Pagamento",
            expandedSections.payment,
            () => toggleSection("payment"),
            renderPaymentContent()
          )}

          {renderExpandableSection(
            "Endereço de Entrega",
            expandedSections.address,
            () => toggleSection("address"),
            renderAddressContent()
          )}

          {renderTracking()}
        </View>

        {renderPrescriptions()}

        {/* Botão de Ligação no Final da Página */}
        {order.estabelecimento?.telefone_contato && (
          <View style={styles.callButtonContainer}>
            <TouchableOpacity
              style={styles.fullWidthCallButton}
              onPress={handleCallEstablishment}
            >
              <MaterialIcons name="phone" size={20} color="#FFFFFF" />
              <Text style={styles.fullWidthCallButtonText}>
                Ligar para o Estabelecimento
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 200,
  },
  orderHeader: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  orderInfo: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  callButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 80,
  },
  fullWidthCallButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidthCallButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  sectionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  expandableSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productsContent: {
    gap: 16,
  },
  productInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  productDetails: {
    fontSize: 12,
    color: "#64748B",
  },
  productQuantity: {
    fontSize: 12,
    color: "#64748B",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  paymentContent: {
    gap: 4,
  },
  paymentType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  paymentDigits: {
    fontSize: 14,
    color: "#64748B",
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  addressDetails: {
    fontSize: 14,
    color: "#64748B",
  },
  prescriptionsSection: {
    marginBottom: 24,
  },
  prescriptionsTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 12,
  },
  prescriptionsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  prescriptionCard: {
    flex: 1,
    aspectRatio: 16 / 9,
    backgroundColor: "rgba(219, 234, 254, 0.5)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  fixedBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  trackingContainer: {
    backgroundColor: "#F1F5F9",
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  trackingProgress: {
    position: "relative",
  },
  progressBar: {
    height: 2,
    backgroundColor: "#E2E8F0",
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
  },
  trackingSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trackingStep: {
    alignItems: "center",
    zIndex: 1,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: "#DBEAFE",
  },
  stepActive: {
    backgroundColor: "#2563EB",
  },
  stepPending: {
    backgroundColor: "#E2E8F0",
  },
  stepLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  stepActiveLabel: {
    color: "#0F172A",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    padding: 10,
    backgroundColor: "#2563EB",
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  cancelledTrackingContainer: {
    backgroundColor: "#FEF2F2",
  },

  stepCancelled: {
    backgroundColor: "#EF4444",
  },

  cancelledNote: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    fontStyle: "italic",
  },
  deliveredContainer: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    borderWidth: 1,
  },

  stepDelivered: {
    backgroundColor: "#10B981",
  },

  deliveredInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
  },

  deliveredNote: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "500",
  },
  cancelledContainer: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
  },

  cancelledContent: {
    alignItems: "center",
    padding: 16,
    gap: 12,
  },

  cancelledTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    textAlign: "center",
  },

  cancelledMessage: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    lineHeight: 20,
  },
  currentStatus: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
  },

  currentStatusText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  statusHighlight: {
    color: "#2563EB",
    fontWeight: "bold",
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  productImageContainer: {
    width: 80,
    alignItems: "center",
  },
  productImageStyle: {
    width: 80,
    height: 80,
    marginBottom: 0,
  },
  productImageInner: {
    width: "100%",
    height: "100%",
  },
});

export default OrderDetails;
