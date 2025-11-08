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
import { OrderDisplay, OrdersDashboardNavigationProp, OrderStatus } from "../../types";
import { storeService } from "../../services/establishment/storeService";


const OrdersDashboardScreen: React.FC = () => {
  const navigation = useNavigation<OrdersDashboardNavigationProp>();
  const [storeOpen, setStoreOpen] = useState(true);
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

  // Função para formatar dados da API para o display
  const formatOrderForDisplay = (order: Order): OrderDisplay => {
    console.log("🔄 [FORMAT] Formatando pedido:", order.idpedido);
    console.log(
      "🔄 [FORMAT] Dados completos do pedido:",
      JSON.stringify(order, null, 2)
    );

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

    console.log("🔄 [FORMAT] Tempo calculado:", {
      dataPedido: order.data_pedido,
      diffMinutes,
      timeAgo,
    });

    // Formata itens do pedido
    const items = order.pedido_itens.map((item) => {
      console.log("🔄 [FORMAT] Item do pedido:", item);
      return {
        name:
          item.catalogo_produto?.produto?.nome_comercial || "Produto sem nome",
        quantity: item.quantidade || 0,
      };
    });

    console.log("🔄 [FORMAT] Itens formatados:", items);

    // 🔥 CORREÇÃO: Converter strings para números com segurança
    const subtotal = order.pedido_itens.reduce((sum, item) => {
      const valorUnitario =
        parseFloat(String(item.valor_unitario_venda).replace(",", ".")) || 0;
      const quantidade = parseInt(String(item.quantidade)) || 0;
      return sum + valorUnitario * quantidade;
    }, 0);

    // 🔥 CORREÇÃO: Converter valor_total para número
    const valorTotal =
      parseFloat(String(order.valor_total).replace(",", ".")) || 0;
    const deliveryFee = Math.max(0, valorTotal - subtotal);

    console.log("🔄 [FORMAT] Valores calculados:", {
      subtotal,
      valorTotal,
      deliveryFee,
      valor_total_original: order.valor_total,
    });

    // 🔥 CORREÇÃO: Função segura para formatar preços
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

  const fetchStoreStatus = useCallback(async () => {
    try {
      console.log("🔄 Buscando status de funcionamento...");
      const isOpen = await storeService.getLoggedEstablishmentStatus();
      setStoreOpen(isOpen);
      console.log("✅ Status da Loja:", isOpen ? "Aberto" : "Fechado");
    } catch (error) {
      console.error("❌ Erro ao buscar status da loja:", error);
      setStoreOpen(false); // Assume fechado em caso de erro
    }
  }, []);

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
        await EstablishmentPedidoService.getOrdersByEstablishmentDashboard();
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
      // Mantém dados mockados em caso de erro (para desenvolvimento)
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
      console.log("🎯 Tela em foco - buscando pedidos reais...");
      fetchOrders();
      fetchStoreStatus();
    }, [fetchOrders, fetchStoreStatus])
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
            borderLeftWidth: 6, // Destaque na borda esquerda
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
                {order.subtotal}
              </Text>
              <Text
                style={[styles.deliveryFee, { color: colors.textSecondary }]}
              >
                {order.deliveryFee}
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
            <View style={styles.prescriptionsGrid}>
              {Array.from({ length: Math.min(order.prescriptions, 3) }).map(
                (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.prescriptionPlaceholder,
                      { backgroundColor: "#e2e8f0" },
                    ]}
                  >
                    <MaterialIcons
                      name="image"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </View>
                )
              )}
              {order.prescriptions > 3 && (
                <View
                  style={[
                    styles.prescriptionPlaceholder,
                    styles.morePrescriptions,
                    { backgroundColor: "#e2e8f0" },
                  ]}
                >
                  <Text
                    style={[
                      styles.morePrescriptionsText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    +{order.prescriptions - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer com Total */}
        <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
          <View style={styles.totalSection}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              {order.total}
            </Text>
          </View>

          {/* Indicador de Urgência para pedidos novos */}
          {(order.status === "Aguardando Pagamento" ||
            order.status === "Em Separação") && (
            <View style={styles.urgencyIndicator}>
              <MaterialIcons
                name="priority-high"
                size={16}
                color={
                  order.status === "Aguardando Pagamento"
                    ? "#ef4444"
                    : "#f59e0b"
                }
              />
              <Text
                style={[
                  styles.urgencyText,
                  {
                    color:
                      order.status === "Aguardando Pagamento"
                        ? "#ef4444"
                        : "#f59e0b",
                  },
                ]}
              >
                {order.status === "Aguardando Pagamento" ? "Novo" : "Preparar"}
              </Text>
            </View>
          )}
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

  const LastUpdateIndicator = () => (
    <View style={[styles.updateIndicator, { backgroundColor: "#e8f4fd" }]}>
      <Text style={[styles.updateText, { color: colors.textSecondary }]}>
        Última atualização: {lastUpdate.toLocaleTimeString()}
      </Text>
      <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
        <MaterialIcons
          name="refresh"
          size={16}
          color={colors.primary}
          style={isRefreshing ? styles.refreshingIcon : undefined}
        />
      </TouchableOpacity>
    </View>
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.storeInfo}>
              <View style={styles.avatarContainer}>
                <MaterialIcons name="person" size={24} color={colors.white} />
              </View>
              <View style={styles.storeDetails}>
                <Text style={[styles.storeName, { color: colors.text }]}>
                  Loja
                </Text>
                <Text
                  style={[
                    styles.storeStatus,
                    // 💡 MUDANÇA: Altera a cor dinamicamente para maior destaque
                    { color: storeOpen ? colors.success : "#ef4444", fontWeight: 'bold' }
                  ]}
                >
                  {storeOpen ? "Aberto" : "Fechado"}
                </Text>
              </View>
            </View>
            {/* 💡 Novo: Botão ou Switch para alternar o status se necessário */}
            {/* Removido o Switch pois o status deve ser calculado pelos horários */}
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.ordersToday}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Pedidos Hoje
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.averageTime}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Tempo Medio
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                styles.fullWidthCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.text }]}>
                R$ {stats.revenue.toFixed(2).replace(".", ",")}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Faturamento
              </Text>
            </View>
          </View>

          {/* Orders Section */}
          <View style={styles.ordersSection}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={[styles.ordersTitle, { color: colors.text }]}>
                Pedidos ({filteredOrders.length})
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                style={styles.refreshButton}
              >
                <MaterialIcons
                  name="refresh"
                  size={16}
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

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <FlatList
                horizontal
                data={filteredOrders}
                renderItem={({ item }) => <OrderCard order={item} />}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ordersList}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToInterval={320}
              />
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
          isActive={true}
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
  content: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#93c5fd",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  storeDetails: {
    gap: 2,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  storeStatus: {
    fontSize: 14,
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
    fontSize: 24,
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
  ordersList: {
    gap: 16,
    paddingRight: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  orderDetails: {
    gap: 2,
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
  orderMeta: {
    alignItems: "flex-end",
    gap: 2,
  },
  orderTime: {
    fontSize: 12,
  },
  orderPrice: {
    fontSize: 12,
    fontWeight: "500",
  },
  prescriptionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  prescriptionPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
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
  // Novos estilos para atualização automática
  updateIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  updateText: {
    fontSize: 12,
  },
  refreshButton: {
    padding: 4,
    alignSelf: "center",
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
  orderCard: {
    width: 320,
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

  orderTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
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

  locationIcon: {
    marginLeft: 8,
  },

  priceInfo: {
    alignItems: "flex-end",
    gap: 2,
  },

  deliveryFee: {
    fontSize: 12,
    color: "#64748b",
  },

  prescriptionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  prescriptionsText: {
    fontSize: 12,
    fontWeight: "500",
  },

  prescriptionsGrid: {
    flexDirection: "row",
    gap: 8,
  },

  morePrescriptions: {
    backgroundColor: "#d1d5db",
  },

  morePrescriptionsText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  totalSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  urgencyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },

  urgencyText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default OrdersDashboardScreen;
