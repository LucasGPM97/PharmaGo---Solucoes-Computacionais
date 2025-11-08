import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { FilterOptions } from "../../types";

interface FilterModalProps {
  visible: boolean;
  filters: FilterOptions;
  activeFiltersCount: number;
  onStatusFilter: (status: boolean | null) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filters,
  activeFiltersCount,
  onStatusFilter,
  onClearFilters,
  onApplyFilters,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header do Modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtrar</Text>
                {activeFiltersCount > 0 && (
                  <View style={styles.activeFiltersBadge}>
                    <Text style={styles.activeFiltersText}>
                      {activeFiltersCount} filtro
                      {activeFiltersCount !== 1 ? "s" : ""} ativo
                      {activeFiltersCount !== 1 ? "s" : ""}
                    </Text>
                  </View>
                )}
              </View>

              {/* Seção de Status */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  Status do Estabelecimento
                </Text>
                <View style={styles.statusContainer}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      filters.aberto === true && styles.selectedStatusButton,
                    ]}
                    onPress={() => onStatusFilter(true)}
                  >
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={filters.aberto === true ? "#FFFFFF" : "#10B981"}
                    />
                    <Text
                      style={[
                        styles.statusButtonText,
                        filters.aberto === true &&
                          styles.selectedStatusButtonText,
                      ]}
                    >
                      Aberto
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      filters.aberto === false && styles.selectedStatusButton,
                    ]}
                    onPress={() => onStatusFilter(false)}
                  >
                    <MaterialIcons
                      name="cancel"
                      size={20}
                      color={filters.aberto === false ? "#FFFFFF" : "#EF4444"}
                    />
                    <Text
                      style={[
                        styles.statusButtonText,
                        filters.aberto === false &&
                          styles.selectedStatusButtonText,
                      ]}
                    >
                      Fechado
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      filters.aberto === null && styles.selectedStatusButton,
                    ]}
                    onPress={() => onStatusFilter(null)}
                  >
                    <MaterialIcons
                      name="all-inclusive"
                      size={20}
                      color={filters.aberto === null ? "#FFFFFF" : "#6B7280"}
                    />
                    <Text
                      style={[
                        styles.statusButtonText,
                        filters.aberto === null &&
                          styles.selectedStatusButtonText,
                      ]}
                    >
                      Todos
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Seção de Tipos (placeholder para futuras implementações) */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  Tipo de Estabelecimento
                </Text>
                <View style={styles.comingSoonContainer}>
                  <MaterialIcons
                    name="construction"
                    size={24}
                    color="#6B7280"
                  />
                  <Text style={styles.comingSoonText}>
                    Em breve - Filtros por tipo de estabelecimento
                  </Text>
                </View>
              </View>

              {/* Botões de Ação */}
              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={[
                    styles.clearFiltersButton,
                    activeFiltersCount === 0 &&
                      styles.clearFiltersButtonDisabled,
                  ]}
                  onPress={onClearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  <MaterialIcons
                    name="clear"
                    size={20}
                    color={activeFiltersCount === 0 ? "#9CA3AF" : "#374151"}
                  />
                  <Text
                    style={[
                      styles.clearFiltersText,
                      activeFiltersCount === 0 &&
                        styles.clearFiltersTextDisabled,
                    ]}
                  >
                    Limpar Filtros
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyFiltersButton}
                  onPress={onApplyFilters}
                >
                  <MaterialIcons name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.applyFiltersText}>Aplicar Filtros</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  activeFiltersBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeFiltersText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  statusContainer: {
    gap: 12,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    gap: 12,
  },
  selectedStatusButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  selectedStatusButtonText: {
    color: "#FFFFFF",
  },
  comingSoonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    gap: 12,
  },
  comingSoonText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    flex: 1,
  },
  filterActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  clearFiltersButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  clearFiltersButtonDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#F3F4F6",
  },
  clearFiltersText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  clearFiltersTextDisabled: {
    color: "#9CA3AF",
  },
  applyFiltersButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    gap: 8,
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default FilterModal;
