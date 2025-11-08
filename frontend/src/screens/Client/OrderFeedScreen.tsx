import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ClientStackParamList } from "../../navigation/ClientNavigator";
import Header from "../../components/common/Header";
import { getOrdersByUserId, Order } from "../../services/client/PedidoService";
// 1. IMPORTAR HOOK/CONTEXTO DE AUTENTICAÇÃO
import { getUserId } from "../../services/common/AuthService"; // 🚨 Substitua pelo caminho real do seu contexto
import Footer from "../../components/common/Footer";
import { SafeAreaView } from "react-native-safe-area-context";

type MyOrdersScreenNavigationProp = StackNavigationProp<
  ClientStackParamList,
  "MyOrders"
>;

interface MyOrdersScreenProps {
  navigation: MyOrdersScreenNavigationProp;
}
const FOOTER_HEIGHT = 65;
const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clienteId, setClienteId] = useState<string | null>(null);
  // 2. ACESSAR O ID DO USUÁRIO LOGADO VIA CONTEXTO

  const userId = getUserId(); // Assumindo que o objeto 'user' no contexto tem a propriedade 'id'

  useEffect(() => {
    // 1a. Primeira etapa: Carregar o ID do usuário uma única vez
    const loadUserId = async () => {
      try {
        const id = await getUserId(); // Assumindo que getUserId é assíncrono (Promise)
        setClienteId(id);
      } catch (e) {
        console.error("Erro ao carregar ID do usuário:", e);
        setError("Não foi possível verificar a autenticação.");
        setLoading(false);
      }
    };

    // Se getUserId for síncrono, você pode simplificar isso:
    // setClienteId(getUserId());

    loadUserId();
  }, []);
  useEffect(() => {
    const fetchOrders = async (id: string) => {
      try {
        const fetchedOrders = await getOrdersByUserId(id);
        setOrders(fetchedOrders);
      } catch (err) {
        setError(
          "Não foi possível carregar seus pedidos. Tente novamente mais tarde."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // 2. A busca só ocorre quando o ID for carregado (e só uma vez)
    if (clienteId) {
      fetchOrders(clienteId);
    } else if (clienteId === null && !loading) {
      // Se clienteId é null E já terminou de carregar (erro/deslogado)
      setError("Usuário não autenticado.");
      Alert.alert("Erro de Autenticação", "Por favor, faça login novamente.");
    }
  }, [clienteId]);

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
    <SafeAreaView style={styles.container}>
      <Header title="Meus Pedidos" showBackButton />

      {/* 🛑 CORREÇÃO: REMOVIDA A SCROLLVIEW EXTERNA 🛑 */}

      {orders.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            Você ainda não fez nenhum pedido. 🛒
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          // Adicione 'flex: 1' ao estilo do container da FlatList se necessário,
          // mas neste caso, o `styles.container` principal já deve ser suficiente.
        />
      )}

      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // --- Estilos de Layout Principal e Correção ---

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Cor do seu estilo "antigo"
  },

  // Estilo usado para o contentContainerStyle da FlatList
  listContent: {
    paddingHorizontal: 24, // Usando o padding do seu estilo "antigo" (scrollContent)
    paddingTop: 16, // Adicionando um padding superior
    flexGrow: 1, // Crucial para o FlatList ocupar o espaço
    paddingBottom: FOOTER_HEIGHT + 24, // 🛑 CORREÇÃO: Compensação do Footer (70px) + padding inferior (24px)
  },

  // --- Estilos de Status e Mensagens ---

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
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
    color: "#6B7280",
  },

  // --- Estilos de Componentes (Pedidos) ---

  // Este será usado no renderItem
  orderCard: {
    backgroundColor: "rgba(59, 130, 246, 0.1)", // Cor do seu estilo "antigo"
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginBottom: 16, // Adicionado para dar espaço entre os cards
  },
  orderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  storeIcon: {
    width: 56,
    height: 56,
    backgroundColor: "#3B82F6",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  orderInfo: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  orderDetails: {
    // Este pode ser usado para a data ou status
    fontSize: 14,
    color: "#6B7280",
  },
  statusDot: {
    // Se for usar para status visual
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  orderDate: {
    fontSize: 12,
    color: "#6B7280",
  },

  // --- Estilos de Componentes não utilizados pela FlatList (removidos ou adaptados) ---
  // Removidos: statusBar, statusBarTime, statusBarIcons, header, headerTitle (pois você usa o componente <Header>)
  // Removido: scrollView, scrollContent (pois estamos usando FlatList)
  // Removido: section, sectionTitle, ordersList, historyList, historyItem (pois a FlatList substitui estas estruturas)
});

export default MyOrdersScreen;
