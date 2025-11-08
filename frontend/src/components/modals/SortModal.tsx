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

type SortOption = "distancia" | "tempo_entrega" | "razao_social";

interface SortModalProps {
  visible: boolean;
  selectedOption: SortOption;
  onOptionSelect: (option: SortOption) => void;
  onClose: () => void;
}

const SortModal: React.FC<SortModalProps> = ({
  visible,
  selectedOption,
  onOptionSelect,
  onClose,
}) => {
  const options = [
    { value: "distancia" as SortOption, label: "Menor distância" },
    { value: "tempo_entrega" as SortOption, label: "Menor tempo de entrega" },
    { value: "razao_social" as SortOption, label: "Ordem alfabética" },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ordenar por</Text>

              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    selectedOption === option.value && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onOptionSelect(option.value);
                    onClose();
                  }}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                  {selectedOption === option.value && (
                    <MaterialIcons name="check" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={onClose}
              >
                <Text style={styles.modalCloseButtonText}>Cancelar</Text>
              </TouchableOpacity>
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
});

export default SortModal;
