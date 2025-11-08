// screens/Client/ShoppingCart.tsx
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  CartService,
  CartItem,
  CartDetails,
} from "../../services/client/CartService";
import Header from "../../components/common/Header";

const { width: screenWidth } = Dimensions.get("window");

type ShoppingCartProps = {
  navigation: any;
};

const initialCartDetails: CartDetails = {
  idcarrinho: 0,
  estabelecimento: { id: 0, name: "" },
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
};

const ShoppingCart: React.FC<ShoppingCartProps> = ({ navigation }) => {
  const [cartDetails, setCartDetails] =
    useState<CartDetails>(initialCartDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const cartItems = cartDetails.items;
  const totalFinal = cartDetails.total;
  const subtotal = cartDetails.subtotal;
  const deliveryFee = cartDetails.deliveryFee;

  useFocusEffect(
    React.useCallback(() => {
      loadCart();
    }, [])
  );

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const details = await CartService.getCartDetails();
      setCartDetails(details);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      Alert.alert("Erro", "Não foi possível carregar o carrinho");
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartData = async () => {
    try {
      const details = await CartService.getCartDetails();
      setCartDetails(details);
      return details;
    } catch (error) {
      console.error("Erro ao buscar dados atualizados do carrinho:", error);
      return null;
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
      return;
    }

    const itemToUpdate = cartItems.find((item) => item.id === id);
    if (!itemToUpdate) return;
    const oldQuantity = itemToUpdate.quantity;

    setCartDetails((prevDetails) => ({
      ...prevDetails,
      items: prevDetails.items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ),
    }));

    try {
      setIsUpdating(true);
      await CartService.updateQuantity(id, newQuantity);
      await updateCartData();
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      Alert.alert("Erro", "Não foi possível atualizar a quantidade");

      setCartDetails((prevDetails) => ({
        ...prevDetails,
        items: prevDetails.items.map((item) =>
          item.id === id ? { ...item, quantity: oldQuantity } : item
        ),
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (id: string) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (!itemToRemove) return;

    setCartDetails((prevDetails) => ({
      ...prevDetails,
      items: prevDetails.items.filter((item) => item.id !== id),
    }));

    try {
      setIsUpdating(true);
      await CartService.removeItem(id);
      await updateCartData();
    } catch (error) {
      console.error("Erro ao remover item:", error);
      Alert.alert("Erro", "Não foi possível remover o item");
      setCartDetails((prevDetails) => ({
        ...prevDetails,
        items: [...prevDetails.items, itemToRemove],
      }));
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    Alert.alert(
      "Limpar Carrinho?",
      "Você tem certeza que deseja remover todos os itens do carrinho?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sim, Limpar",
          onPress: async () => {
            try {
              setIsUpdating(true);
              await CartService.clearCart();
              setCartDetails(initialCartDetails);
              Alert.alert("Sucesso", "O carrinho foi esvaziado.");
            } catch (error) {
              console.error("Erro ao limpar carrinho:", error);
              Alert.alert("Erro", "Não foi possível limpar o carrinho");
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const continueShopping = () => {
    navigation.goBack();
  };

  const ClearCartComponent = () => {
    if (cartItems.length === 0) {
      return null;
    }

    return (
      <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Limpar</Text>
      </TouchableOpacity>
    );
  };

  const checkout = async () => {
    if (cartItems.length === 0 || isUpdating) {
      Alert.alert("Carrinho vazio", "Seu carrinho está vazio");
      return;
    }

    try {
      setIsUpdating(true);

      const updatedDetails = await CartService.getCartDetails();

      if (updatedDetails) {
        console.log("💰 Dados finais para checkout (com taxa):", {
          subtotal: updatedDetails.subtotal,
          deliveryFee: updatedDetails.deliveryFee,
          total: updatedDetails.total,
        });

        navigation.navigate("ConfirmAddress", {
          cartItems: updatedDetails.items,
          total: updatedDetails.total,
          cartDetails: updatedDetails,
        });
      }
    } catch (error) {
      console.error("Erro ao preparar checkout:", error);
      Alert.alert(
        "Erro",
        "Não foi possível finalizar o pedido. Tente novamente."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Formatar preço
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace(".", ",")}`;
  };

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.itemImage}>
        <MaterialIcons name="image" size={36} color="#9CA3AF" />
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>{item.details}</Text>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, isUpdating && styles.buttonDisabled]}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={isUpdating}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantityValue}>
            {isUpdating ? "..." : item.quantity}
          </Text>

          <TouchableOpacity
            style={[styles.quantityButton, isUpdating && styles.buttonDisabled]}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={isUpdating}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemRightSection}>
        <Text style={styles.itemPrice}>
          {formatPrice(item.price * item.quantity)}
        </Text>
        <TouchableOpacity
          style={[styles.removeButton, isUpdating && styles.buttonDisabled]}
          onPress={() => removeItem(item.id)}
          disabled={isUpdating}
        >
          <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <MaterialIcons name="shopping-cart" size={64} color="#9CA3AF" />
      <Text style={styles.emptyCartText}>Seu carrinho está vazio</Text>
      <Text style={styles.emptyCartSubtext}>
        Adicione produtos para continuar
      </Text>
      <TouchableOpacity
        style={styles.continueShoppingButton}
        onPress={continueShopping}
      >
        <Text style={styles.continueShoppingText}>Continuar comprando</Text>
      </TouchableOpacity>
    </View>
  );

  // 💡 renderFooter ATUALIZADO
  const renderFooter = () => {
    if (cartItems.length === 0) {
      return null;
    }

    return (
      <View style={styles.footer}>
        {/* 💡 Subtotal */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
        </View>

        {/* 💡 Taxa de Entrega */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Taxa de Entrega</Text>
          <Text
            style={[styles.totalValue, deliveryFee === 0 && { color: "green" }]}
          >
            {deliveryFee === 0 ? "Grátis" : formatPrice(deliveryFee)}
          </Text>
        </View>

        {/* 💡 Total Final */}
        <View
          style={[
            styles.totalSection,
            {
              marginTop: 10,
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              paddingTop: 10,
            },
          ]}
        >
          <Text style={styles.totalLabel}>Total do Pedido</Text>
          <Text style={styles.totalValueFinal}>{formatPrice(totalFinal)}</Text>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={continueShopping}
          >
            <Text style={styles.continueButtonText}>Continuar comprando</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkoutButton} onPress={checkout}>
            <Text style={styles.checkoutButtonText}>Fechar pedido</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Carrinho"
          showBackButton
          customRightComponent={<ClearCartComponent />}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando carrinho...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Carrinho"
        showBackButton
        customRightComponent={<ClearCartComponent />}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          cartItems.length === 0 && styles.emptyScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length === 0
          ? renderEmptyCart()
          : cartItems.map(renderCartItem)}
      </ScrollView>

      {renderFooter()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // ... (Estilos não alterados)
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  itemDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  quantityButton: {
    width: 24,
    height: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    textAlign: "center",
    lineHeight: 20,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    minWidth: 24,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  emptyCart: {
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  continueShoppingButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  continueShoppingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  totalValueFinal: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  itemRightSection: {
    alignItems: "flex-end",
    gap: 8,
  },
  removeButton: {
    padding: 4,
  },
});

export default ShoppingCart;
