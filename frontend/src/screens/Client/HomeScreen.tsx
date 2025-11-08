import React, { useState, useEffect, useCallback } from "react"; // Adicionado useEffect e useCallback
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator, // Adicionado para loading
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";

// 🚨 Importe o Service: Ajuste o caminho conforme a localização do seu arquivo de serviço
import { storeService } from "../../services/establishment/storeService";

import { Estabelecimento } from "../../types";

const { width: screenWidth } = Dimensions.get("window");

// Adaptação dos tipos para usar os dados da API
type Store = Estabelecimento & {
  id: string; // Usaremos idestabelecimento como string para ID
  nome: string;
  distance: string;
  deliveryTime: string;
  isOpen: boolean;
};

type FilterOptions = {
  isOpen: boolean | null;
};

type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
};

const MobileApp: React.FC<{ navigation: NavigationProps }> = ({
  navigation,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortOption, setSortOption] = useState<
    "distance" | "deliveryTime" | "name"
  >("distance");
  const [filters, setFilters] = useState<FilterOptions>({
    isOpen: null,
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // 1. NOVOS ESTADOS PARA DADOS DA API
  const [apiStores, setApiStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dados mockados de slides
  const slides = Array(5).fill(null);

  // Função de mapeamento dos dados da API para o formato de UI (Store)
  const mapApiToStore = (apiData: Estabelecimento[]): Store[] => {
    return apiData.map((item) => ({
      ...item,
      id: item.idestabelecimento.toString(),
      nome: item.razao_social,
      distance: item.distancia || "2km", // Assumindo que a API retorna isso formatado
      deliveryTime: item.tempo_entrega || "30 min", // Assumindo que a API retorna isso formatado
      isOpen: item.aberto, // Assumindo que a API retorna isso
    }));
  };

  // 2. FUNÇÃO PARA BUSCAR ESTABELECIMENTOS NA API
  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await storeService.getAllStores();
      const mappedStores = mapApiToStore(data as Estabelecimento[]); // Use 'as Estabelecimento[]' se o tipo for necessário
      setApiStores(mappedStores);
      console.log(data);
    } catch (e) {
      console.error("Falha ao buscar estabelecimentos:", e);
      setError("Não foi possível carregar as lojas. Tente novamente.");
      setApiStores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. CHAMADA DA API NA MONTAGEM DO COMPONENTE
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Filtrar e ordenar a lista REAL
  const getFilteredAndSortedStores = () => {
    let filteredStores = [...apiStores]; // Usa o estado da API, não o mock

    // Aplicar filtros
    if (filters.isOpen !== null) {
      filteredStores = filteredStores.filter(
        (store) => store.isOpen === filters.isOpen
      );
    }

    // Aplicar ordenação
    switch (sortOption) {
      case "distance":
        // ⚠️ A ordenação por distância agora depende de distância formatada
        filteredStores.sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
        );
        break;
      case "deliveryTime":
        // ⚠️ A ordenação por tempo de entrega agora depende de tempo_entrega formatado
        filteredStores.sort(
          (a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime)
        );
        break;
      case "name":
        filteredStores.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
    }

    return filteredStores;
  };

  const filteredStores = getFilteredAndSortedStores();

  // 4. MOCK DE ÚLTIMOS ESTABELECIMENTOS (agora baseado nos dados da API)
  const lastStores = apiStores.slice(0, 4).map((store) => ({
    id: store.idestabelecimento,
    name: store.nome,
  }));

  // 5. ATUALIZAÇÃO DA NAVEGAÇÃO para passar os dados
  const navigateToStore = (store: Store) => {
    console.log(`Navegando para loja: ${store.nome} (ID: ${store.id})`);

    // 🚨 PASSANDO O ID E DEMAIS DADOS DO ESTABELECIMENTO PARA A PRÓXIMA TELA
    navigation.navigate("EstablishmentDetails", {
      storeId: store.id,
      storeName: store.nome,
      storeDistance: store.distance,
      storeDeliveryTime: store.deliveryTime,
      // Você pode passar o objeto Store inteiro se quiser
      storeData: store,
    });
    alert(`Navegando para: ${store.nome}`);
  };

  // Atualizar contador de filtros ativos
  React.useEffect(() => {
    let count = 0;
    if (filters.isOpen !== null) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleStatusFilter = (status: boolean | null) => {
    setFilters((prev) => ({ ...prev, isOpen: status }));
  };

  const clearFilters = () => {
    setFilters({
      isOpen: null,
    });
  };

  const renderCarousel = () => (
    <View style={styles.carouselSection}>
      <View style={styles.carouselContainer}>
        <View style={styles.carouselSlide}>
          <MaterialIcons name="image" size={48} color="#9CA3AF" />
        </View>
      </View>
      <View style={styles.carouselDots}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderLastStores = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimos Estabelecimentos</Text>
        <TouchableOpacity>
          <Text style={styles.seeMoreText}>Ver mais</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lastStoresScroll}
      >
        {/* Usando os dados reais ou mockados baseados nos reais */}
        {lastStores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={styles.storeCard}
            // 🚨 Passando o objeto Store completo (ou reconstruindo ele se quiser)
            onPress={() =>
              navigateToStore(
                apiStores.find((s) => s.idestabelecimento === store.id) as Store
              )
            }
          >
            <View style={styles.storeImage}>
              <MaterialIcons name="store" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.storeName}>{store.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStores = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Estabelecimentos</Text>
        <TouchableOpacity>
          <Text style={styles.seeMoreText}>Ver mais</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSortModal(true)}
        >
          <View style={styles.filterButtonContent}>
            <MaterialIcons
              name="sync-alt"
              size={16}
              color="#111827"
              style={styles.rotatedIcon}
            />
            <Text style={styles.filterButtonText}>Ordenar</Text>
            <MaterialIcons name="expand-more" size={16} color="#111827" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <View style={styles.filterButtonContent}>
            <MaterialIcons name="filter-list" size={16} color="#111827" />
            <Text style={styles.filterButtonText}>Filtrar</Text>
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.storesList}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 20 }}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredStores.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhuma loja encontrada com os filtros atuais.
          </Text>
        ) : (
          filteredStores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={styles.storeItem}
              onPress={() => navigateToStore(store)}
            >
              <View style={styles.storeAvatar}>
                <MaterialIcons name="store" size={24} color="#007AFF" />
              </View>
              <View style={styles.storeInfo}>
                <View style={styles.storeHeader}>
                  <Text style={styles.storeItemName}>{store.nome}</Text>
                  {store.isOpen ? (
                    <View style={styles.openBadge}>
                      <Text style={styles.openBadgeText}>ABERTO</Text>
                    </View>
                  ) : (
                    <View style={styles.closedBadge}>
                      <Text style={styles.closedBadgeText}>FECHADO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.storeDetails}>
                  {store.endereco_estabelecimento?.cidade} •{" "}
                  {store.endereco_estabelecimento?.bairro}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );

  const renderSortModal = () => (
    <Modal visible={showSortModal} transparent={true} animationType="slide">
      <TouchableWithoutFeedback onPress={() => setShowSortModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ordenar por</Text>

              <TouchableOpacity
                style={[
                  styles.optionItem,
                  sortOption === "distance" && styles.selectedOption,
                ]}
                onPress={() => {
                  setSortOption("distance");
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.optionText}>Menor distância</Text>
                {sortOption === "distance" && (
                  <MaterialIcons name="check" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionItem,
                  sortOption === "deliveryTime" && styles.selectedOption,
                ]}
                onPress={() => {
                  setSortOption("deliveryTime");
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.optionText}>Menor tempo de entrega</Text>
                {sortOption === "deliveryTime" && (
                  <MaterialIcons name="check" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionItem,
                  sortOption === "name" && styles.selectedOption,
                ]}
                onPress={() => {
                  setSortOption("name");
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.optionText}>Ordem alfabética</Text>
                {sortOption === "name" && (
                  <MaterialIcons name="check" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSortModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal visible={showFilterModal} transparent={true} animationType="slide">
      <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar</Text>

            {/* Filtro por Status */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.statusContainer}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    filters.isOpen === true && styles.selectedStatusButton,
                  ]}
                  onPress={() => handleStatusFilter(true)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      filters.isOpen === true &&
                        styles.selectedStatusButtonText,
                    ]}
                  >
                    Aberto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    filters.isOpen === false && styles.selectedStatusButton,
                  ]}
                  onPress={() => handleStatusFilter(false)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      filters.isOpen === false &&
                        styles.selectedStatusButtonText,
                    ]}
                  >
                    Fechado
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    filters.isOpen === null && styles.selectedStatusButton,
                  ]}
                  onPress={() => handleStatusFilter(null)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      filters.isOpen === null &&
                        styles.selectedStatusButtonText,
                    ]}
                  >
                    Todos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botões de Ação */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyFiltersText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header showLocation showCartIcon />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCarousel()}
        {renderLastStores()}
        {renderStores()}
      </ScrollView>
      <Footer />
      {renderSortModal()}
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  carouselSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  carouselContainer: {
    height: 192,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselSlide: {
    justifyContent: "center",
    alignItems: "center",
  },
  carouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: "#007AFF",
  },
  inactiveDot: {
    backgroundColor: "#D1D5DB",
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
  },
  lastStoresScroll: {
    gap: 16,
    paddingRight: 16,
  },
  storeCard: {
    width: 140,
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  storeImage: {
    width: "100%",
    height: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
    marginBottom: 2,
  },
  storeType: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
  },
  rotatedIcon: {
    transform: [{ rotate: "90deg" }],
  },
  filterButtonText: {
    fontSize: 14,
    color: "#111827",
  },
  filterBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#007AFF",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  storesList: {
    gap: 16,
  },
  storeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 16,
  },
  storeAvatar: {
    width: 48,
    height: 48,
    backgroundColor: "#DBEAFE",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  storeItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  openBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closedBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  storeDetails: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 20,
    textAlign: "center",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  selectedOption: {
    backgroundColor: "#F3F4F6",
  },
  optionText: {
    fontSize: 16,
    color: "#000000",
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  // Filter Modal Styles
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  statusContainer: {
    gap: 12,
  },
  statusButton: {
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedStatusButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  statusButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  selectedStatusButtonText: {
    color: "#FFFFFF",
  },
  filterActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clearFiltersText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center",
  },
  applyFiltersText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  errorText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#EF4444",
  },
  emptyText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
  },
});

export default MobileApp;
