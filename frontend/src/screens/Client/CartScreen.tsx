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
import { CartService, CartItem } from "../../services/client/CartService";
import Header from "../../components/common/Header";

const { width: screenWidth } = Dimensions.get("window");

type ShoppingCartProps = {
  navigation: any;
};

const ShoppingCart: React.FC<ShoppingCartProps> = ({ navigation }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Carregar carrinho quando a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      loadCart();
    }, [])
  );

  // Carregar carrinho da API
  const loadCart = async () => {
    try {
      setIsLoading(true);
      const items = await CartService.getCart();
      setCartItems(items);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      Alert.alert("Erro", "Não foi possível carregar o carrinho");
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar quantidade
  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remover item se quantidade for 0
      removeItem(id);
      return;
    }

    const itemToUpdate = cartItems.find((item) => item.id === id);
    if (!itemToUpdate) return;
    const oldQuantity = itemToUpdate.quantity;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      setIsUpdating(true);
      await CartService.updateQuantity(id, newQuantity);
      await updateCartData(); // Recarrega o carrinho para ter os dados atualizados
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      Alert.alert("Erro", "Não foi possível atualizar a quantidade");

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: oldQuantity } : item
        )
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Remover item
  const removeItem = async (id: string) => {
    const itemToRemove = cartItems.find((item) => item.id === id);
    if (!itemToRemove) return;
    const remainingItems = cartItems.filter((item) => item.id !== id);

    setCartItems(remainingItems);

    try {
      setIsUpdating(true);
      await CartService.removeItem(id);
      await updateCartData(); // Recarrega o carrinho
    } catch (error) {
      console.error("Erro ao remover item:", error);
      Alert.alert("Erro", "Não foi possível remover o item");
      setCartItems((prevItems) => [...prevItems, itemToRemove]);
    } finally {
      setIsUpdating(false);
    }
  };

  // Limpar carrinho
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
              // 💡 Atualiza o estado local imediatamente, sem refetch
              setCartItems([]);
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

  // Calcular total
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateCartData = async () => {
    try {
      const items = await CartService.getCart();
      setCartItems(items);
      // O total será recalculado automaticamente
    } catch (error) {
      console.error("Erro ao buscar dados atualizados do carrinho:", error);
      // Não mostramos um alerta grande, pois já estamos em uma operação interativa.
    }
  };

  // Continuar comprando
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
  // Fechar pedido
  const checkout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Carrinho vazio", "Seu carrinho está vazio");
      return;
    }
    
    console.log('Fechando pedido...', cartItems);
    navigation.navigate('ConfirmAddress', { cartItems, total });
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

  const renderFooter = () => {
    if (cartItems.length === 0) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconButton: {
    padding: 4,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  headerSpacer: {
    width: 40,
  },
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
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: "#000000",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  footerButtons: {
    flexDirection: "row",
    gap: 12,
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
