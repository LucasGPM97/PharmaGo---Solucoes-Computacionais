// components/common/Footer.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParamList } from "../../navigation/ClientNavigator";
import { TabType } from "../../types/common/navigation";

type FooterNavigationProp = NativeStackNavigationProp<ClientStackParamList>;

const Footer: React.FC = () => {
  const navigation = useNavigation<FooterNavigationProp>();
  const route = useRoute();

  const tabs = [
    { key: "home" as TabType, icon: "home", label: "Início", screen: "Home" },
    {
      key: "search" as TabType,
      icon: "search",
      label: "Busca",
      screen: "Search",
    },
    {
      key: "orders" as TabType,
      icon: "receipt-long",
      label: "Pedidos",
      screen: "OrderFeed",
    },
    {
      key: "profile" as TabType,
      icon: "person-outline",
      label: "Perfil",
      screen: "Profile",
    },
  ];

  // Pega o nome da tela atual
  const currentRouteName = route.name;

  const handleTabPress = (tab: (typeof tabs)[0]) => {
    if (currentRouteName !== tab.screen) {
      navigation.navigate(tab.screen as any);
    }
  };

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => {
        const isActive = currentRouteName === tab.screen;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.footerButton}
            onPress={() => handleTabPress(tab)}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={24}
              color={isActive ? "#007AFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.footerButtonText,
                isActive && styles.footerButtonActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  footerButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  footerButtonText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  footerButtonActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default Footer;
