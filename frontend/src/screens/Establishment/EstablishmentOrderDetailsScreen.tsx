import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { EstablishmentStackParamList } from "../../navigation/EstablishmentNavigator";
import {
  EstablishmentPedidoService,
  Order,
} from "../../services/establishment/PedidoService";
import Header from "../../components/common/Header";

type OrderStatus =
  | "pending"
  | "accepted"
  | "in_separation"
  | "in_route"
  | "delivered"
  | "cancelled";
type PrescriptionStatus = "pending" | "validated" | "rejected";

interface Prescription {
  id: string;
  type: "image";
  uri: string;
  status: PrescriptionStatus;
}

interface RouteParams {
  orderId: string;
}

const EstablishmentOrderDetailsScreen: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<EstablishmentStackParamList>>();
  const route = useRoute();
  const { orderId } = route.params as RouteParams;

  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
  const [expandedSections, setExpandedSections] = useState({
    products: false,
    address: false,
    summary: false,
    prescriptions: false,
  });
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const colors = {
    primary: "#007AFF",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#6C6C70",
    border: "#E5E5EA",
    grayLight: "#F2F2F7",
    white: "#FFFFFF",
    danger: "#FF3B30",
    success: "#34C759",
    warning: "#FF9500",
  };

  const fetchOrderDetails = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        console.log("🔄 Buscando detalhes do pedido:", orderId);

        const orders =
          await EstablishmentPedidoService.getOrdersByEstablishment();
        const order = orders.find((o) => o.idpedido.toString() === orderId);

        if (order) {
          console.log("✅ Pedido encontrado:", order);
          setOrderData(order);

          // Mapeia o status da API para o status interno
          const statusMap: { [key: string]: OrderStatus } = {
            "Aguardando Pagamento": "pending",
            "Em Separação": "in_separation",
            "Em Rota": "in_route",
            Entregue: "delivered",
            Cancelado: "cancelled",
          };

          setOrderStatus(statusMap[order.status] || "pending");
        } else {
          console.error("❌ Pedido não encontrado");
        }
      } catch (error) {
        console.error("❌ Erro ao buscar detalhes do pedido:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [orderId]
  );

  const handleUpdateOrderStatus = async (
    newStatus: OrderStatus,
    statusText: string
  ) => {
    try {
      setIsUpdatingStatus(true);

      console.log(`🔄 Atualizando pedido ${orderId} para: ${statusText}`);

      const statusMap: { [key: OrderStatus]: string } = {
        pending: "Aguardando Pagamento",
        accepted: "Em Separação",
        in_separation: "Em Separação",
        in_route: "Em Rota",
        delivered: "Entregue",
        cancelled: "Cancelado",
      };

      const apiStatus = statusMap[newStatus];

      await EstablishmentPedidoService.updateOrderStatus(orderId, apiStatus);

      setOrderStatus(newStatus);

      await fetchOrderDetails();

      Alert.alert("Sucesso", `Pedido ${statusText.toLowerCase()} com sucesso!`);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar status:", error);
      Alert.alert(
        "Erro",
        "Não foi possível atualizar o status do pedido. Tente novamente."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmAction = (action: string, onConfirm: () => void) => {
    Alert.alert(
      "Confirmação",
      `Tem certeza que deseja ${action.toLowerCase()} este pedido?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Confirmar", onPress: onConfirm },
      ]
    );
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleRefresh = () => {
    fetchOrderDetails(true);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePrescriptionPress = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleValidatePrescription = (prescriptionId: string) => {
    console.log("Validando receita:", prescriptionId);
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
  };

  const handleRejectPrescription = (prescriptionId: string) => {
    console.log("Recusando receita:", prescriptionId);
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
  };

  const handleCallClient = async () => {
    if (!orderData?.cliente.numero_contato) {
      Alert.alert("Informação", "Telefone do estabelecimento não disponível.");

      return;
    }
   const phoneNumber = orderData.cliente.numero_contato;
       console.log(orderData.cliente.numero_contato);
   
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

  const formatPrice = (price: string | number): string => {
    const value =
      typeof price === "string" ? parseFloat(price.replace(",", ".")) : price;
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const calculateSubtotal = (): number => {
    if (!orderData?.pedido_itens) return 0;

    return orderData.pedido_itens.reduce((sum, item) => {
      const valorUnitario =
        parseFloat(String(item.valor_unitario_venda).replace(",", ".")) || 0;
      const quantidade = parseInt(String(item.quantidade)) || 0;
      return sum + valorUnitario * quantidade;
    }, 0);
  };

  const calculateDeliveryFee = (): number => {
    if (!orderData?.valor_total) return 0;

    const subtotal = calculateSubtotal();
    const total =
      parseFloat(String(orderData.valor_total).replace(",", ".")) || 0;
    return Math.max(0, total - subtotal);
  };

  const AccordionSection: React.FC<{
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }> = ({ title, isExpanded, onToggle, children }) => (
    <View
      style={[styles.accordionSection, { borderBottomColor: colors.border }]}
    >
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle}>
        <Text style={[styles.accordionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <MaterialIcons
          name={isExpanded ? "expand-less" : "expand-more"}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {isExpanded && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );

  const PrescriptionCard: React.FC<{ prescription: Prescription }> = ({
    prescription,
  }) => {
    const getStatusColor = () => {
      switch (prescription.status) {
        case "validated":
          return colors.success;
        case "rejected":
          return colors.danger;
        default:
          return colors.textSecondary;
      }
    };

    const getStatusText = () => {
      switch (prescription.status) {
        case "validated":
          return "Validada";
        case "rejected":
          return "Recusada";
        default:
          return "Pendente";
      }
    };

    return (
      <TouchableOpacity
        style={[styles.prescriptionCard, { backgroundColor: colors.grayLight }]}
        onPress={() => handlePrescriptionPress(prescription)}
      >
        <MaterialIcons name="image" size={40} color={getStatusColor()} />
        <Text style={[styles.prescriptionText, { color: getStatusColor() }]}>
          Receita {prescription.id}
        </Text>
        <Text style={[styles.prescriptionStatus, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </TouchableOpacity>
    );
  };

  const NavButton: React.FC<{
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    isActive?: boolean;
    onPress: () => void;
  }> = ({ icon, label, isActive = false, onPress }) => (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <MaterialIcons
        name={icon}
        size={24}
        color={isActive ? colors.primary : colors.textSecondary}
      />
      <Text
        style={[
          styles.navLabel,
          { color: isActive ? colors.primary : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Carregando detalhes do pedido...
        </Text>
      </View>
    );
  }

  if (!orderData) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <MaterialIcons name="error-outline" size={48} color={colors.danger} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Pedido não encontrado
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subtotal = calculateSubtotal();
  const deliveryFee = calculateDeliveryFee();
  const total =
    parseFloat(String(orderData.valor_total).replace(",", ".")) || 0;

  const mockPrescriptions: Prescription[] = [
    {
      id: "1",
      type: "image",
      uri: "prescription_1.jpg",
      status: "pending",
    },
    {
      id: "2",
      type: "image",
      uri: "prescription_2.jpg",
      status: "pending",
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header title={`Pedido N° ${orderData.idpedido}`} showBackButton />

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.mainContent}>
          {/* Status do Pedido */}
          <View
            style={[styles.statusCard, { backgroundColor: colors.grayLight }]}
          >
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              Status do Pedido
            </Text>
            <View style={styles.statusBadge}>
              <MaterialIcons
                name="receipt-long"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {orderData.status}
              </Text>
            </View>
          </View>

          {/* Customer Info */}
          <View
            style={[styles.customerCard, { backgroundColor: colors.grayLight }]}
          >
            <Text style={[styles.customerName, { color: colors.text }]}>
              {orderData.cliente?.nome || "Cliente"}
            </Text>
            <Text
              style={[styles.customerPhone, { color: colors.textSecondary }]}
            >
              Telefone: {orderData.cliente?.numero_contato || "Não informado"}
            </Text>
          </View>

          {/* Products Accordion */}
          <AccordionSection
            title="Produtos do Pedido"
            isExpanded={expandedSections.products}
            onToggle={() => toggleSection("products")}
          >
            {orderData.pedido_itens?.map((item) => (
              <View key={item.idpedido_item} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]}>
                    {item.catalogo_produto?.produto?.nome_comercial ||
                      "Produto sem nome"}
                  </Text>
                  <Text
                    style={[
                      styles.productQuantity,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.catalogo_produto.produto.apresentacao}
                  </Text>
                  <Text
                    style={[
                      styles.productQuantity,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Quantidade: {item.quantidade}
                  </Text>
                </View>
                <Text style={[styles.productPrice, { color: colors.text }]}>
                  {formatPrice(item.valor_unitario_venda)}
                </Text>
              </View>
            ))}
          </AccordionSection>

          {/* Address Accordion */}
          <AccordionSection
            title="Endereço de Entrega"
            isExpanded={expandedSections.address}
            onToggle={() => toggleSection("address")}
          >
            <View style={styles.addressContent}>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {orderData.endereco_cliente?.logradouro}{" "}
                {orderData.endereco_cliente?.numero}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {orderData.endereco_cliente?.bairro}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {orderData.endereco_cliente?.cidade} -{" "}
                {orderData.endereco_cliente?.estado}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                CEP: {orderData.endereco_cliente?.cep}
              </Text>
            </View>
          </AccordionSection>

          {/* Summary Accordion */}
          <AccordionSection
            title="Resumo de valores"
            isExpanded={expandedSections.summary}
            onToggle={() => toggleSection("summary")}
          >
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Subtotal
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatPrice(subtotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Taxa de entrega
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {formatPrice(deliveryFee)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Desconto
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  R$ 0,00
                </Text>
              </View>
              <View
                style={[
                  styles.summaryDivider,
                  { backgroundColor: colors.border },
                ]}
              />
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryTotalLabel, { color: colors.text }]}
                >
                  Total
                </Text>
                <Text
                  style={[styles.summaryTotalValue, { color: colors.text }]}
                >
                  {formatPrice(total)}
                </Text>
              </View>
            </View>
          </AccordionSection>

          {/* Prescriptions Accordion */}
          <AccordionSection
            title="Receitas anexadas"
            isExpanded={expandedSections.prescriptions}
            onToggle={() => toggleSection("prescriptions")}
          >
            <View style={styles.prescriptionsContainer}>
              <View style={styles.prescriptionsGrid}>
                {mockPrescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                  />
                ))}
              </View>
            </View>
          </AccordionSection>

          {/* Action Buttons */}
          {orderStatus === "pending" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.rejectButton,
                  { backgroundColor: colors.danger },
                ]}
                onPress={() =>
                  confirmAction("recusar", () =>
                    handleUpdateOrderStatus("cancelled", "Cancelado")
                  )
                }
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Recusar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.acceptButton,
                  { backgroundColor: colors.success },
                ]}
                onPress={() =>
                  confirmAction("aceitar", () =>
                    handleUpdateOrderStatus("in_separation", "Em Separação")
                  )
                }
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Aceitar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {orderStatus === "in_separation" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => handleUpdateOrderStatus("in_route", "Em Rota")}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>
                    Marcar como Pronto para Entrega
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {orderStatus === "in_route" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: colors.success },
                ]}
                onPress={() => handleUpdateOrderStatus("delivered", "Entregue")}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Marcar como Entregue</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {(orderStatus === "pending" || orderStatus === "in_separation") && (
            <TouchableOpacity
              style={[styles.button,styles.contactButton, {backgroundColor: colors.warning},]}
              onPress={handleCallClient}
            >
              <MaterialIcons name="phone" size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                Entrar em Contato
              </Text>
            </TouchableOpacity>
            
          )}
        </View>
      </ScrollView>

      {/* Modal para visualização da receita */}
      <Modal
        visible={showPrescriptionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrescriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Receita {selectedPrescription?.id}
              </Text>
              <TouchableOpacity
                onPress={() => setShowPrescriptionModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.prescriptionImageContainer}>
              <MaterialIcons
                name="image"
                size={120}
                color={colors.textSecondary}
              />
              <Text
                style={[
                  styles.prescriptionPlaceholder,
                  { color: colors.textSecondary },
                ]}
              >
                Imagem da Receita {selectedPrescription?.id}
              </Text>
            </View>

            <View style={styles.prescriptionActions}>
              <TouchableOpacity
                style={[
                  styles.prescriptionButton,
                  { backgroundColor: colors.danger },
                ]}
                onPress={() =>
                  selectedPrescription &&
                  handleRejectPrescription(selectedPrescription.id)
                }
              >
                <MaterialIcons name="close" size={20} color={colors.white} />
                <Text style={styles.prescriptionButtonText}>Recusar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.prescriptionButton,
                  { backgroundColor: colors.success },
                ]}
                onPress={() =>
                  selectedPrescription &&
                  handleValidatePrescription(selectedPrescription.id)
                }
              >
                <MaterialIcons name="check" size={20} color={colors.white} />
                <Text style={styles.prescriptionButtonText}>Validar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer Navigation */}
      <View
        style={[
          styles.footer,
          { backgroundColor: "#ffffff", borderTopColor: colors.border },
        ]}
      >
        <NavButton
          icon="home"
          label="Home"
          onPress={() => navigation.navigate("EstablishmentHome")}
        />
        <NavButton
          icon="inventory-2"
          label="Produtos"
          onPress={() => navigation.navigate("ManageProducts")}
        />
        <NavButton
          icon="receipt-long"
          label="Pedidos"
          onPress={() => navigation.navigate("ManageOrders")}
        />
        <NavButton
          icon="person-outline"
          label="Perfil"
          onPress={() => navigation.navigate("EstablishmentProfile")}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  customerCard: {
    padding: 16,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
  },
  accordionSection: {
    borderBottomWidth: 1,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  accordionContent: {
    paddingVertical: 8,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 12,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
  },
  addressContent: {
    gap: 4,
  },
  addressText: {
    fontSize: 14,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  prescriptionsContainer: {
    marginTop: 8,
  },
  prescriptionsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  prescriptionCard: {
    flex: 1,
    height: 120,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  prescriptionText: {
    fontSize: 12,
    fontWeight: "500",
  },
  prescriptionStatus: {
    fontSize: 10,
    fontWeight: "400",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {},
  acceptButton: {},
  primaryButton: {},
  contactButton: {
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  prescriptionImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    marginBottom: 20,
  },
  prescriptionPlaceholder: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  prescriptionActions: {
    flexDirection: "row",
    gap: 12,
  },
  prescriptionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  prescriptionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EstablishmentOrderDetailsScreen;
