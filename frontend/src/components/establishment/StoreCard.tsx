import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Estabelecimento } from "../../types/establishment";

interface StoreCardProps {
  store: Estabelecimento;
  onPress: (storeId: number, storeName: string) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => onPress(store.idestabelecimento, store.razao_social)}
    >
      <View style={styles.storeImage}>
        <MaterialIcons name="store" size={32} color="#9CA3AF" />
      </View>
      <Text style={styles.storeName}>{store.razao_social}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default StoreCard;
