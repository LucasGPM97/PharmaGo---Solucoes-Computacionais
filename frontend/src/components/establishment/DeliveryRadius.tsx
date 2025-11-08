import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

export interface DeliveryRadiusModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (radius: number) => void;
  initialRadius?: number;
}

const DeliveryRadiusModal: React.FC<DeliveryRadiusModalProps> = ({
  visible,
  onClose,
  onSave,
  initialRadius = 15,
}) => {
  const [radius, setRadius] = useState(initialRadius);

  const handleSave = () => {
    onSave(radius);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backgroundDimmer}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.bottomSheet}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Definir Raio de Entrega</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Arraste para ajustar a distância máxima para entregas.
          </Text>

          <View style={styles.radiusDisplay}>
            <Text style={styles.radiusNumber}>{radius}</Text>
            <Text style={styles.radiusUnit}>km</Text>
          </View>

          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Raio Selecionado</Text>
              <Text style={styles.radiusValue}>{radius} km</Text>
            </View>

            <View style={styles.sliderWrapper}>
              <Text style={styles.sliderMinMax}>1km</Text>

              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={radius}
                onValueChange={setRadius}
                minimumTrackTintColor="#0d59f2"
                maximumTrackTintColor="#e2e8f0"
                thumbTintColor="#0d59f2"
              />

              <Text style={styles.sliderMinMax}>50km</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Salvar Raio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backgroundDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  bottomSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
    maxHeight: "80%",
  },
  handleContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#dbdfe6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111318",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f6f8",
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 20,
  },
  radiusDisplay: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    backgroundColor: "#f8fafc",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  radiusNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#0d59f2",
  },
  radiusUnit: {
    fontSize: 16,
    color: "#64748b",
    marginTop: -8,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111318",
  },
  radiusValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0d59f2",
  },
  sliderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMinMax: {
    fontSize: 12,
    color: "#64748b",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0d59f2",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
});

export default DeliveryRadiusModal;
