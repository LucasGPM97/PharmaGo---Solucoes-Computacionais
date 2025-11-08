import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ClientStackParamList } from "../../navigation/ClientNavigator";
import Header from "../../components/common/Header";
import { getOrdersByUserId, Order } from "../../services/client/PedidoService";
// 1. IMPORTAR HOOK/CONTEXTO DE AUTENTICAÇÃO
import { getUserId } from "../../services/common/AuthService"; // 🚨 Substitua pelo caminho real do seu contexto

type MyOrdersScreenNavigationProp = StackNavigationProp<
  ClientStackParamList,
  "MyOrders"
>;

interface MyOrdersScreenProps {
  navigation: MyOrdersScreenNavigationProp;
}

const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. ACESSAR O ID DO USUÁRIO LOGADO VIA CONTEXTO

  const userId = getUserId(); // Assumindo que o objeto 'user' no contexto tem a propriedade 'id'

  useEffect(() => {
    const fetchOrders = async (id: string) => {
      try {
        const fetchedOrders = await getOrdersByUserId(id);
        setOrders(fetchedOrders);
      } catch (err) {
        // Em produção, você pode querer logar o erro completo no console: console.error(err);
        setError(
          "Não foi possível carregar seus pedidos. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    // 3. GARANTIR QUE O ID EXISTE ANTES DE FAZER A CHAMADA
    if (userId) {
      // Se o ID for string (como '1'), o useEffect rodará quando mudar.
      fetchOrders(userId);
    } else {
      // Se o usuário não estiver logado, não há pedidos para buscar.
      setLoading(false);
      setError("Usuário não autenticado.");
      Alert.alert("Erro de Autenticação", "Por favor, faça login novamente.");
      // Opcional: navigation.navigate('Login');
    }
  }, [userId]); // Dependência no userId para recarregar se o login/usuário mudar

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
    >
      <Text style={styles.orderId}>Pedido # {item.id}</Text>
      <Text style={styles.orderDate}>
        Data: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text style={styles.orderTotal}>
        Total: R$ {item.totalAmount.toFixed(2)}
      </Text>
      <Text style={styles.orderStatus}>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Carregando pedidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Meus Pedidos" showBackButton />
      {orders.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            Você ainda não fez nenhum pedido. 🛒
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)} // Garantir que a key é string
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (Estilos permanecem os mesmos)
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyListText: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  orderCard: {
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
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 14,
    color: "#666",
  },
});

export default MyOrdersScreen;
