import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Estabelecimento } from "../../types";

interface StoreItemProps {
  store: Estabelecimento;
  onPress: (idestabelecimento: number, razao_social: string) => void;
}

const StoreItem: React.FC<StoreItemProps> = ({ store, onPress }) => {
  if (!store) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.storeItem}
      onPress={() => onPress(store.idestabelecimento, store.razao_social)}
    >
      <View style={styles.storeAvatar}>
        <MaterialIcons name="store" size={24} color="#007AFF" />
      </View>
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeItemName} numberOfLines={1}>
            {store.razao_social}
          </Text>
          {store.aberto ? (
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
          {store.distancia} • {store.tempo_entrega}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    alignItems: "flex-start",
    marginBottom: 4,
  },
  storeItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
    marginRight: 8,
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
  storeType: {
    fontSize: 12,
    color: "#6B7280",
  },
});
export default StoreItem;
