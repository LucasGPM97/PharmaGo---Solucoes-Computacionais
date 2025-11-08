import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  EstablishmentPedidoService,
  Order,
  OrderStats,
} from "../../services/establishment/PedidoService";
import { statusColors } from "../../utils/statusColors";
import {
  OrderDisplay,
  OrdersDashboardNavigationProp,
  OrderStatus,
} from "../../types";
import Header from "../../components/common/Header";

const ManageOrdersScreen: React.FC = () => {
  const navigation = useNavigation<OrdersDashboardNavigationProp>();
  const [activeFilter, setActiveFilter] = useState<OrderStatus>("all");
  const [ordersData, setOrdersData] = useState<OrderDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [stats, setStats] = useState<OrderStats>({
    ordersToday: 0,
    averageTime: "0 min",
    revenue: 0,
  });

  const colors = {
    primary: "#4f46e5",
    background: "#f8fafc",
    card: "#ffffff",
    text: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    white: "#ffffff",
    success: "#68d391",
  };

  // Função para obter configurações do status
  const getStatusConfig = (status: string) => {
    return (
      statusColors[status as keyof typeof statusColors] || {
        border: "#6b7280",
        background: "#f9fafb",
        icon: "help-outline",
        iconColor: "#6b7280",
        label: status,
      }
    );
  };

  // Função para formatar dados da API para o display
  const formatOrderForDisplay = (order: Order): OrderDisplay => {
    console.log("🔄 [FORMAT] Formatando pedido:", order.idpedido);

    // Calcula tempo decorrido
    const orderDate = new Date(order.data_pedido);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - orderDate.getTime()) / (1000 * 60)
    );

    let timeAgo = "";
    if (diffMinutes < 1) timeAgo = "Agora mesmo";
    else if (diffMinutes < 60) timeAgo = `há ${diffMinutes} min`;
    else if (diffMinutes < 1440)
      timeAgo = `há ${Math.floor(diffMinutes / 60)} h`;
    else timeAgo = `há ${Math.floor(diffMinutes / 1440)} dias`;

    // Formata itens do pedido
    const items = order.pedido_itens.map((item) => {
      return {
        name:
          item.catalogo_produto?.produto?.nome_comercial || "Produto sem nome",
        quantity: item.quantidade || 0,
      };
    });

    // Converter strings para números com segurança
    const subtotal = order.pedido_itens.reduce((sum, item) => {
      const valorUnitario =
        parseFloat(String(item.valor_unitario_venda).replace(",", ".")) || 0;
      const quantidade = parseInt(String(item.quantidade)) || 0;
      return sum + valorUnitario * quantidade;
    }, 0);

    const valorTotal =
      parseFloat(String(order.valor_total).replace(",", ".")) || 0;
    const deliveryFee = Math.max(0, valorTotal - subtotal);

    const formatPriceSafe = (price: number): string => {
      return `R$ ${price.toFixed(2).replace(".", ",")}`;
    };

    return {
      id: order.idpedido.toString(),
      status: order.status as OrderStatus,
      customer: order.cliente?.nome || "Cliente",
      distance: "1,5 km",
      timeAgo,
      items,
      subtotal: formatPriceSafe(subtotal),
      deliveryFee: formatPriceSafe(deliveryFee),
      total: formatPriceSafe(valorTotal),
      prescriptions: 0,
      originalOrder: order,
    };
  };

  // Função para buscar pedidos da API
  const fetchOrders = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      console.log("🔄 Buscando pedidos reais...");

      // Busca pedidos reais da API
      const orders =
        await EstablishmentPedidoService.getOrdersByEstablishment();
      console.log("✅ Pedidos recebidos:", orders.length);

      // Formata para display
      const formattedOrders = orders.map(formatOrderForDisplay);
      setOrdersData(formattedOrders);

      // Busca estatísticas
      const todayStats = await EstablishmentPedidoService.getTodayStats();
      setStats(todayStats);

      setLastUpdate(new Date());
    } catch (error) {
      console.error("❌ Erro ao buscar pedidos:", error);
      // Mantém dados mockados em caso de erro
      const mockOrders: OrderDisplay[] = [
        {
          id: "123456",
          status: "Aguardando Pagamento",
          customer: "Fulano",
          distance: "1,2 km",
          timeAgo: "há 2 min",
          items: [
            { name: "Dipirona 500mg", quantity: 1 },
            { name: "Paracetamol 750mg", quantity: 2 },
          ],
          subtotal: "R$ 40,00",
          deliveryFee: "R$ 10,00",
          total: "R$ 50,00",
          prescriptions: 2,
          originalOrder: {} as Order,
        },
        {
          id: "123457",
          status: "Em Separação",
          customer: "Ciclano",
          distance: "2,1 km",
          timeAgo: "há 15 min",
          items: [{ name: "Ibuprofeno 400mg", quantity: 1 }],
          subtotal: "R$ 25,00",
          deliveryFee: "R$ 8,00",
          total: "R$ 33,00",
          prescriptions: 1,
          originalOrder: {} as Order,
        },
        {
          id: "123458",
          status: "Em Rota",
          customer: "Beltrano",
          distance: "0,8 km",
          timeAgo: "há 45 min",
          items: [
            { name: "Omeprazol 20mg", quantity: 2 },
            { name: "Losartana 50mg", quantity: 1 },
          ],
          subtotal: "R$ 68,00",
          deliveryFee: "R$ 12,00",
          total: "R$ 80,00",
          prescriptions: 3,
          originalOrder: {} as Order,
        },
        {
          id: "123459",
          status: "Entregue",
          customer: "Maria Silva",
          distance: "1,7 km",
          timeAgo: "há 2 h",
          items: [{ name: "Paracetamol 750mg", quantity: 1 }],
          subtotal: "R$ 18,00",
          deliveryFee: "R$ 9,00",
          total: "R$ 27,00",
          prescriptions: 0,
          originalOrder: {} as Order,
        },
      ];
      setOrdersData(mockOrders);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Busca quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      console.log("🎯 Tela em foco - buscando pedidos...");
      fetchOrders();
    }, [fetchOrders])
  );

  // Atualização manual (pull to refresh)
  const handleRefresh = () => {
    console.log("👆 Atualização manual...");
    fetchOrders(true);
  };

  const filters: Array<{ key: OrderStatus; label: string }> = [
    { key: "all", label: "Todos" },
    { key: "Aguardando Pagamento", label: "Novos" },
    { key: "Em Separação", label: "Separação" },
    { key: "Em Rota", label: "Rota de Entrega" },
    { key: "Entregue", label: "Entregue" },
    { key: "Cancelado", label: "Cancelado" },
  ];

  const filteredOrders = ordersData.filter(
    (order) => activeFilter === "all" || order.status === activeFilter
  );

  const handleOrderPress = (orderId: string) => {
    navigation.navigate("EstablishmentOrderDetails", { orderId });
  };

  const FilterButton: React.FC<{
    label: string;
    isActive: boolean;
    onPress: () => void;
  }> = ({ label, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: isActive ? colors.primary : colors.card,
          borderColor: isActive ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: isActive ? colors.white : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const OrderCard: React.FC<{ order: OrderDisplay }> = ({ order }) => {
    const statusConfig = getStatusConfig(order.status);

    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          {
            backgroundColor: colors.card,
            borderColor: statusConfig.border,
            borderWidth: 2,
            borderLeftWidth: 6,
          },
        ]}
        onPress={() => handleOrderPress(order.id)}
        activeOpacity={0.7}
      >
        {/* Header com Status */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <View style={styles.orderTitleRow}>
              <Text style={[styles.orderId, { color: colors.text }]}>
                Pedido #{order.id}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.background },
                ]}
              >
                <MaterialIcons
                  name={statusConfig.icon as any}
                  size={14}
                  color={statusConfig.iconColor}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.iconColor }]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              {order.items.map((item, index) => (
                <Text
                  key={index}
                  style={[styles.orderItem, { color: colors.textSecondary }]}
                >
                  {item.quantity}x {item.name}
                </Text>
              ))}
              <View style={styles.locationInfo}>
                <MaterialIcons name="person" size={14} color={colors.primary} />
                <Text
                  style={[styles.locationText, { color: colors.textSecondary }]}
                >
                  {order.customer}
                </Text>
                <MaterialIcons
                  name="location-on"
                  size={14}
                  color={colors.textSecondary}
                  style={styles.locationIcon}
                />
                <Text
                  style={[styles.locationText, { color: colors.textSecondary }]}
                >
                  {order.distance}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.orderMeta}>
            <Text style={[styles.orderTime, { color: colors.textSecondary }]}>
              {order.timeAgo}
            </Text>
            <View style={styles.priceInfo}>
              <Text style={[styles.orderPrice, { color: colors.text }]}>
                {order.total}
              </Text>
            </View>
          </View>
        </View>

        {/* Receitas Anexadas */}
        {order.prescriptions > 0 && (
          <View style={styles.prescriptionsContainer}>
            <View style={styles.prescriptionsHeader}>
              <MaterialIcons
                name="description"
                size={16}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.prescriptionsText,
                  { color: colors.textSecondary },
                ]}
              >
                {order.prescriptions} receita(s) anexada(s)
              </Text>
            </View>
          </View>
        )}

        {/* Footer com Total e Ações */}
        <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
          <View style={styles.totalSection}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              {order.timeAgo}
            </Text>
          </View>

          {/* Botões de Ação baseados no status */}
          <View style={styles.actionButtons}>
            {order.status === "Aguardando Pagamento" && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[styles.actionButtonText, { color: colors.white }]}
                >
                  Confirmar
                </Text>
              </TouchableOpacity>
            )}
            {order.status === "Em Separação" && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.success },
                ]}
              >
                <Text
                  style={[styles.actionButtonText, { color: colors.white }]}
                >
                  Pronto
                </Text>
              </TouchableOpacity>
            )}
            {order.status === "Em Rota" && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[styles.actionButtonText, { color: colors.white }]}
                >
                  Entregue
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
          Carregando pedidos...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header title="Gerenciar Pedidos" showBackButton />

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
        

          {/* Orders Section */}
          <View style={styles.ordersSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.ordersTitle, { color: colors.text }]}>
                Todos os Pedidos ({filteredOrders.length})
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                style={styles.refreshButton}
              >
                <MaterialIcons
                  name="refresh"
                  size={20}
                  color={colors.primary}
                  style={isRefreshing ? styles.refreshingIcon : undefined}
                />
              </TouchableOpacity>
            </View>

            {/* Filter Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              {filters.map((filter) => (
                <FilterButton
                  key={filter.key}
                  label={filter.label}
                  isActive={activeFilter === filter.key}
                  onPress={() => setActiveFilter(filter.key)}
                />
              ))}
            </ScrollView>

            {/* Orders List - Vertical para melhor visualização */}
            {filteredOrders.length > 0 ? (
              <View style={styles.ordersListVertical}>
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="receipt-long"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Nenhum pedido encontrado
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubtext,
                    { color: colors.textSecondary },
                  ]}
                >
                  {activeFilter === "all"
                    ? "Aguardando novos pedidos..."
                    : `Nenhum pedido com status "${
                        filters.find((f) => f.key === activeFilter)?.label
                      }"`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

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
          isActive={true}
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
  content: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    gap: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 100,
  },
  fullWidthCard: {
    flexBasis: "100%",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  ordersSection: {
    gap: 16,
  },
  ordersTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  filtersContainer: {
    marginHorizontal: -16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  ordersListVertical: {
    gap: 16,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderInfo: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderDetails: {
    gap: 4,
  },
  orderItem: {
    fontSize: 12,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  locationText: {
    fontSize: 12,
  },
  locationIcon: {
    marginLeft: 8,
  },
  orderMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  orderTime: {
    fontSize: 12,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  prescriptionsContainer: {
    marginTop: 8,
  },
  prescriptionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  prescriptionsText: {
    fontSize: 12,
    fontWeight: "500",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
  },
  totalSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
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
  refreshButton: {
    padding: 4,
  },
  refreshingIcon: {
    transform: [{ rotate: "180deg" }],
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default ManageOrdersScreen;
