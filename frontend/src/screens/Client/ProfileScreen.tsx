import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Footer from "../../components/common/Footer";
import { SafeAreaView } from "react-native-safe-area-context";
import { clearAuthData } from "../../services/common/AuthService";

type ProfileScreenProps = {
  navigation: any;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const userId = "123"; // Substituir por ID do usuário real

  const handleLogout = () => {
    clearAuthData();

    navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    setProfileImage(imageUrl);
    Alert.alert("Sucesso", "Imagem de perfil atualizada!");
  };
  const colors = {
    primary: "#007AFF",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#6B7280",
    border: "#E5E5EA",
    grayLight: "#F2F2F7",
    white: "#FFFFFF",
  };

  const MenuItem: React.FC<{
    title: string;
    subtitle?: string;
    onPress: () => void;
    showBorder?: boolean;
  }> = ({ title, subtitle, onPress, showBorder = true }) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        showBorder && {
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={colors.textSecondary}
      />
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
        color={isActive ? colors.primary : colors.textSecondary}
      />
      <Text
        style={[
          styles.navLabel,
          { color: isActive ? colors.primary : colors.textSecondary },
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
      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialIcons name="person" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.profileName, { color: colors.text }]}>
              Cliente
            </Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <MenuItem
              title="Dados da Conta"
              onPress={() => navigation.navigate("AccountDetails")}
            />
            <MenuItem
              title="Pagamentos"
              onPress={() => console.log("Pagamentos")}
            />
            <MenuItem
              title="Endereços"
              onPress={() => navigation.navigate("AddressManagement")}
            />
            <MenuItem title="Suporte" onPress={() => console.log("Suporte")} />
            <MenuItem title="Sair" onPress={handleLogout} showBorder={false} />
          </View>
        </View>
      </ScrollView>

      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 48,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#DBEAFE",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  menuSection: {
    gap: 0,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
export default ProfileScreen;
