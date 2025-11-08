import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { EstablishmentStackParamList } from "../../navigation/EstablishmentNavigator";
import Header from "../../components/common/Header";
import ProductImageWithOverlay from "../../components/common/ProductImage"; //
type EstablishmentHomeScreenNavigationProp = StackNavigationProp<
  EstablishmentStackParamList,
  "ManageProducts"
>;

interface EstablishmentHomeScreenProps {
  navigation: EstablishmentHomeScreenNavigationProp;
}

const ManageProductsScreen: React.FC<
  EstablishmentHomeScreenNavigationProps
> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("products");
  const colors = {
    primary: "#007AFF",
    background: "#FFFFFF",
    text: "#000000",
    border: "#E5E5EA",
    gray: "#8E8E93",
  };

  // Navegação entre tabs
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);

    switch (tab) {
      case "orders":
        navigation.navigate("ManageOrders");
        break;
      case "products":
        break;
      case "profile":
        navigation.navigate("EstablishmentHome");
        break;
      case "home":
      default:
        navigation.navigate("EstablishmentHome");
        break;
    }
  };

  const MenuItem: React.FC<{
    title: string;
    onPress: () => void;
  }> = ({ title, onPress }) => (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <Text style={[styles.menuText, { color: colors.text }]}>{title}</Text>
      <MaterialIcons name="chevron-right" size={24} color="#C7C7CC" />
    </TouchableOpacity>
  );

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
        color={isActive ? colors.primary : colors.gray}
      />
      <Text
        style={[
          styles.navLabel,
          { color: isActive ? colors.primary : colors.gray },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header title="Gerenciar Produtos" />

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <View style={styles.menuSection}>
          <MenuItem
            title="Cadastrar novo produto"
            onPress={() => navigation.navigate("AddProduct")}
          />
          <MenuItem
            title="Gerenciar produtos"
            onPress={() => navigation.navigate("EstablishmentProductDetails")}
          />
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
          onPress={() => navigation.navigate("EstablishmentHome")}
        />
        <NavButton
          icon="inventory-2"
          label="Produtos"
          isActive={true}
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuSection: {
    gap: 0,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 80,
    borderTopWidth: 1,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ManageProductsScreen;
