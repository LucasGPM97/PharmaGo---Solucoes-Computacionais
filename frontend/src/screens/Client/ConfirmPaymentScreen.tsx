import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import Header from "../../components/common/Header";

type PaymentMethod = "local" | "card" | "wallet" | "pix";

const PaymentMethod = ({ navigation }: any) => {
  const route = useRoute();
  const { selectedAddress, cartTotal } = route.params || {};

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("local");


  const proceedToNext = () => {
    alert("Avançando para revisão do pedido");
    navigation.navigate("OrderSummary", {
      selectedAddress: selectedAddress,
      selectedPaymentMethod: selectedMethod,
      cartTotal: cartTotal,
    });
  };

  const renderRadioButton = (isSelected: boolean) => (
    <View
      style={[styles.radioButton, isSelected && styles.radioButtonSelected]}
    >
      {isSelected && <View style={styles.radioButtonInner} />}
    </View>
  );

  // 🔹 Renderiza cada opção de pagamento
  const renderOption = (
    label: string,
    method: PaymentMethod,
    disabled: boolean = false
  ) => (
    <TouchableOpacity
      style={[
        styles.paymentOptionCard,
        selectedMethod === method && styles.paymentOptionCardSelected,
        disabled && styles.disabledOption,
      ]}
      disabled={disabled}
      onPress={() => !disabled && setSelectedMethod(method)}
    >
      {renderRadioButton(selectedMethod === method)}
      <Text
        style={[styles.paymentOptionCardText, disabled && styles.disabledText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Header title="Forma de Pagamento" showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderOption("Receber no local", "local")}

        {renderOption("Cartão", "card", true)}

        {renderOption("Pix", "pix", true)}

        {renderOption("Apple Pay / Google Pay", "wallet", true)}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.proceedButton} onPress={proceedToNext}>
          <Text style={styles.proceedButtonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
    color: "#1F2937",
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  paymentOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  paymentOptionCardSelected: {
    borderColor: "#007AFF",
    backgroundColor: "rgba(0,122,255,0.1)",
  },
  paymentOptionCardText: {
    fontSize: 16,
    color: "#1F2937",
  },
  disabledOption: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#9CA3AF",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#007AFF",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  footer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  proceedButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default PaymentMethod;
