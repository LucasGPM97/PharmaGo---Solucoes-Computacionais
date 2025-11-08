// components/stores/StoreInfo.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface StoreInfoProps {
  name: string;
  distancia: string;
  tempo_entrega: string;
  showAvatar?: boolean;
  avatarSize?: number;
}

const StoreInfo: React.FC<StoreInfoProps> = ({
  name,
  distancia,
  tempo_entrega,
  showAvatar = true,
  avatarSize = 96,
}) => {
  return (
    <View style={styles.storeInfoSection}>
      {showAvatar && (
        <View
          style={[
            styles.storeAvatar,
            { width: avatarSize, height: avatarSize },
          ]}
        >
          <MaterialIcons name="store" size={avatarSize * 0.5} color="#9CA3AF" />
        </View>
      )}
      <Text style={styles.storeName}>{name}</Text>
      <Text style={styles.storeDetails}>
        {distancia} / {tempo_entrega}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  storeInfoSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  storeAvatar: {
    backgroundColor: "#E5E7EB",
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  storeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  storeDetails: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default StoreInfo;
