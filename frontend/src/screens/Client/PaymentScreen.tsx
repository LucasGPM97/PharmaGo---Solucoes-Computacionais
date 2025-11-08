import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ClientStackParamList } from "../../navigation/ClientNavigator";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import { Ionicons } from "@expo/vector-icons";
import {
  getCart,
  clearCart,
  CartItem,
} from "../../services/client/CartService";
import { createOrder } from "../../services/client/PedidoService";

type PaymentScreenNavigationProp = StackNavigationProp<
  ClientStackParamList,
  "Payment"
>;

interface PaymentScreenProps {
  navigation: PaymentScreenNavigationProp;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "credit_card" | "pix" | "cash" | null
  >(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock user and establishment IDs for now
  const userId = "user123";
  const establishmentId = "establishment456";

  useEffect(() => {
    const fetchCart = async () => {
      const items = await getCart();
      setCartItems(items);
    };
    fetchCart();
  }, []);

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Erro", "Por favor, selecione uma forma de pagamento.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Erro", "Seu carrinho está vazio.");
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder(userId, establishmentId, cartItems);
      await clearCart();
      Alert.alert("Sucesso", "Pedido realizado com sucesso!");
      navigation.navigate("OrderSuccess", { orderId: order.id });
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      Alert.alert(
        "Erro",
        "Não foi possível finalizar o pedido. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      <Header title="Pagamento" showBackButton />
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Selecione a forma de pagamento</Text>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === "credit_card" && styles.selectedOption,
          ]}
          onPress={() => setSelectedPaymentMethod("credit_card")}
          disabled={loading}
        >
          <Ionicons
            name="card-outline"
            size={24}
            color={selectedPaymentMethod === "credit_card" ? "#007bff" : "#333"}
          />
          <Text
            style={[
              styles.paymentOptionText,
              selectedPaymentMethod === "credit_card" &&
                styles.selectedOptionText,
            ]}
          >
            Cartão de Crédito
          </Text>
          {selectedPaymentMethod === "credit_card" && (
            <Ionicons name="checkmark-circle" size={20} color="#007bff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === "pix" && styles.selectedOption,
          ]}
          onPress={() => setSelectedPaymentMethod("pix")}
          disabled={loading}
        >
          <Ionicons
            name="qr-code-outline"
            size={24}
            color={selectedPaymentMethod === "pix" ? "#007bff" : "#333"}
          />
          <Text
            style={[
              styles.paymentOptionText,
              selectedPaymentMethod === "pix" && styles.selectedOptionText,
            ]}
          >
            Pix
          </Text>
          {selectedPaymentMethod === "pix" && (
            <Ionicons name="checkmark-circle" size={20} color="#007bff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            selectedPaymentMethod === "cash" && styles.selectedOption,
          ]}
          onPress={() => setSelectedPaymentMethod("cash")}
          disabled={loading}
        >
          <Ionicons
            name="cash-outline"
            size={24}
            color={selectedPaymentMethod === "cash" ? "#007bff" : "#333"}
          />
          <Text
            style={[
              styles.paymentOptionText,
              selectedPaymentMethod === "cash" && styles.selectedOptionText,
            ]}
          >
            Dinheiro
          </Text>
          {selectedPaymentMethod === "cash" && (
            <Ionicons name="checkmark-circle" size={20} color="#007bff" />
          )}
        </TouchableOpacity>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total do Pedido</Text>
          <Text style={styles.totalAmount}>R$ {total.toFixed(2)}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title={
            loading ? <ActivityIndicator color="#fff" /> : "Confirmar Pagamento"
          }
          onPress={handleConfirmPayment}
          disabled={!selectedPaymentMethod || loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  selectedOption: {
    borderColor: "#007bff",
    borderWidth: 2,
  },
  paymentOptionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 15,
    backgroundColor: "#fff",
  },
});

export default PaymentScreen;
