import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import StoreCard from "../establishment/StoreCard";
import { Estabelecimento } from "../../types/establishment";

interface LastStoresSectionProps {
  stores: Estabelecimento[];
  onStorePress: (storeId: number, storeName: string) => void;
  onSeeMorePress: () => void;
}

const LastStoresSection: React.FC<LastStoresSectionProps> = ({
  stores,
  onStorePress,
  onSeeMorePress,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimos Estabelecimentos</Text>
        <TouchableOpacity onPress={onSeeMorePress}>
          <Text style={styles.seeMoreText}>Ver mais</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lastStoresScroll}
      >
        {stores.map((store) => (
          <StoreCard
            key={store.idestabelecimento}
            store={store}
            onPress={onStorePress}
          />
        ))}
      </ScrollView>
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
  lastStoresScroll: {
    gap: 16,
    paddingRight: 16,
  },
});

export default LastStoresSection;
