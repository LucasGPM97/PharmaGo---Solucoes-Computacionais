import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Header from "../../components/common/Header";

type OrderStatus = "pending" | "accepted";
type PrescriptionStatus = "pending" | "validated" | "rejected";

interface Prescription {
  id: string;
  type: "image";
  uri: string;
  status: PrescriptionStatus;
}

const OrderDetailsScreen: React.FC<EstablishmentHomeScreenNavigationProps> = ({
  navigation,
}) => {
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
  };

  // Dados do pedido (simulando dados da API)
  const orderData = {
    id: "12345",
    customer: "Cliente Fulano",
    phone: "(61) 9 9999-9999",
    products: [
      {
        id: "1",
        name: "Dipirona 500mg 10 comprimidos",
        quantity: 2,
        price: "R$ 23,99",
      },
      {
        id: "2",
        name: "Paracetamol 750mg 12 comprimidos",
        quantity: 1,
        price: "R$ 15,90",
      },
      {
        id: "3",
        name: "Ibuprofeno 400mg 8 comprimidos",
        quantity: 1,
        price: "R$ 12,50",
      },
    ],
    address: {
      street: "Rua das Flores, 123",
      neighborhood: "Centro",
      city: "Brasília",
      state: "DF",
      zipCode: "70000-000",
      complement: "Apartamento 101",
    },
    summary: {
      subtotal: "R$ 52,39",
      deliveryFee: "R$ 10,00",
      discount: "R$ 0,00",
      total: "R$ 62,39",
    },
    prescriptions: [
      {
        id: "1",
        type: "image" as const,
        uri: "prescription_1.jpg",
        status: "pending" as PrescriptionStatus,
      },
      {
        id: "2",
        type: "image" as const,
        uri: "prescription_2.jpg",
        status: "pending" as PrescriptionStatus,
      },
    ],
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
    // Aqui você faria a chamada para a API para validar a receita
    console.log("Validando receita:", prescriptionId);
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
  };

  const handleRejectPrescription = (prescriptionId: string) => {
    // Aqui você faria a chamada para a API para recusar a receita
    console.log("Recusando receita:", prescriptionId);
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header title="Pedido N° xxxxxx" showBackButton />

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContent}>
          {/* Customer Info */}
          <View
            style={[styles.customerCard, { backgroundColor: colors.grayLight }]}
          >
            <Text style={[styles.customerName, { color: colors.text }]}>
              {orderData.customer}
            </Text>
            <Text
              style={[styles.customerPhone, { color: colors.textSecondary }]}
            >
              Telefone: {orderData.phone}
            </Text>
          </View>

          {/* Products Accordion */}
          <AccordionSection
            title="Produtos do Pedido"
            isExpanded={expandedSections.products}
            onToggle={() => toggleSection("products")}
          >
            {orderData.products.map((product) => (
              <View key={product.id} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.text }]}>
                    {product.name}
                  </Text>
                  <Text
                    style={[
                      styles.productQuantity,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Quantidade: {product.quantity}
                  </Text>
                </View>
                <Text style={[styles.productPrice, { color: colors.text }]}>
                  {product.price}
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
                {orderData.address.street}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {orderData.address.neighborhood}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                {orderData.address.city} - {orderData.address.state}
              </Text>
              <Text style={[styles.addressText, { color: colors.text }]}>
                CEP: {orderData.address.zipCode}
              </Text>
              {orderData.address.complement && (
                <Text style={[styles.addressText, { color: colors.text }]}>
                  Complemento: {orderData.address.complement}
                </Text>
              )}
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
                  {orderData.summary.subtotal}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Taxa de entrega
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {orderData.summary.deliveryFee}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                  Desconto
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {orderData.summary.discount}
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
                  {orderData.summary.total}
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
                {orderData.prescriptions.map((prescription) => (
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
                onPress={() => console.log("Recusar pedido")}
              >
                <Text style={styles.buttonText}>Recusar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.acceptButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => setOrderStatus("accepted")}
              >
                <Text style={styles.buttonText}>Aceitar</Text>
              </TouchableOpacity>
            </View>
          )}

          {orderStatus === "accepted" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.contactButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => console.log("Entrar em contato")}
              >
                <Text style={styles.buttonText}>Entrar em contato</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 20,
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
  // Modal styles
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

export default OrderDetailsScreen;
