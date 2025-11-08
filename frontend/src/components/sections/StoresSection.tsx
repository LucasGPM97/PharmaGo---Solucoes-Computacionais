import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import StoreItem from "../establishment/StoreItem";
import { Estabelecimento, FilterOptions } from "../../types";

type SortOption = "distancia" | "tempo_entrega" | "razao_social";

interface StoresSectionProps {
  stores: Estabelecimento[];
  filters: FilterOptions;
  sortOption: SortOption;
  activeFiltersCount: number;
  onStorePress: (storeId: number, storeName: string) => void;
  onSeeMorePress: () => void;
  onSortPress: () => void;
  onFilterPress: () => void;
}

const StoresSection: React.FC<StoresSectionProps> = ({
  stores,
  filters,
  sortOption,
  activeFiltersCount,
  onStorePress,
  onSeeMorePress,
  onSortPress,
  onFilterPress,
}) => {
  // Função para filtrar e ordenar as lojas
  const getFilteredAndSortedStores = () => {
    let filteredStores = [...stores];

    // Aplicar filtros
    if (filters.aberto !== null) {
      filteredStores = filteredStores.filter(
        (store) => store.isOpen === filters.aberto
      );
    }

    // Aplicar ordenação
    switch (sortOption) {
      case "distancia":
        filteredStores.sort(
          (a, b) => parseFloat(a.distancia) - parseFloat(b.distancia)
        );
        break;
      case "tempo_entrega":
        filteredStores.sort(
          (a, b) =>
            parseInt(a.tempo_entrega.split("-")[0]) -
            parseInt(b.tempo_entrega.split("-")[0])
        );
        break;
      case "razao_social":
        filteredStores.sort((a, b) =>
          a.razao_social.localeCompare(b.razao_social)
        );
        break;
    }

    return filteredStores;
  };

  const filteredStores = getFilteredAndSortedStores();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Estabelecimentos</Text>
        <TouchableOpacity onPress={onSeeMorePress}>
          <Text style={styles.seeMoreText}>Ver mais</Text>
        </TouchableOpacity>
      </View>

      {/* Botões de Filtro e Ordenação */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={onSortPress}>
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

        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
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

      {/* Lista de Estabelecimentos */}
      <View style={styles.storesList}>
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <StoreItem
              key={store.idestabelecimento}
              store={store}
              onPress={onStorePress}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>
              Nenhum estabelecimento encontrado
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Tente ajustar os filtros para ver mais resultados
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    position: "relative",
  },
  rotatedIcon: {
    transform: [{ rotate: "90deg" }],
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
});

export default StoresSection;
