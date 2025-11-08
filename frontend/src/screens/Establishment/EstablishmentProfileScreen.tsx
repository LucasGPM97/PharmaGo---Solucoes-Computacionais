import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import BusinessHoursModal, {
  DaySchedule,
} from "../../components/establishment/BussinesHours";
import DeliveryRadiusModal from "../../components/establishment/DeliveryRadius";
import AddressModalEstablishment, {
  AddressData,
} from "../../components/establishment/AddressModalEstablishment";
import { clearAuthData } from "../../services";
import { CommonActions } from "@react-navigation/native";
import { getEnderecosByEstabelecimento } from "../../services/establishment/EstablishmentAddressService";
import { EstablishmentStackParamList } from "../../navigation/EstablishmentNavigator";

const EstablishmentProfileScreen: React.FC<EstablishmentStackParamList> = ({
  navigation,
}) => {
  const colors = {
    primary: "#007AFF",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#6B7280",
    border: "#E5E5EA",
    grayLight: "#F2F2F7",
    white: "#FFFFFF",
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [businessSchedule, setBusinessSchedule] = useState<
    DaySchedule[] | undefined
  >(undefined);

  const [isDeliveryRadiusModalVisible, setIsDeliveryRadiusModalVisible] =
    useState(false);
  const [deliveryRadius, setDeliveryRadius] = useState<number>(15);

  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Função para carregar endereços
  const fetchAddress = async () => {
    setIsLoadingAddress(true);
    try {
      const addresses = await getEnderecosByEstabelecimento();
      if (addresses.length > 0) {
        setSavedAddress(addresses[0]);
      } else {
        setSavedAddress(null); // Garante que fique null se não houver endereços
      }
    } catch (error) {
      console.error("Erro ao carregar endereço:", error);
      setSavedAddress(null);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Carrega endereços quando o componente monta
  useEffect(() => {
    fetchAddress();
  }, []);

  // Função para abrir o modal
  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  // Função para salvar o horário
  const handleSaveSchedule = (newSchedule: DaySchedule[]) => {
    setBusinessSchedule(newSchedule);
    console.log("Horário Salvo:", newSchedule);
  };

  // Funções para o modal de raio de entrega
  const handleOpenDeliveryRadiusModal = () => {
    setIsDeliveryRadiusModalVisible(true);
  };

  const handleCloseDeliveryRadiusModal = () => {
    setIsDeliveryRadiusModalVisible(false);
  };

  const handleSaveDeliveryRadius = (radius: number) => {
    setDeliveryRadius(radius);
    console.log("Raio de Entrega Salvo:", radius, "km");
  };

  // CORREÇÃO: Funções para o modal de endereço
  const handleOpenAddressModal = () => {
    if (isLoadingAddress) return;
    setIsAddressModalVisible(true);
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalVisible(false);
  };

  //  Função para salvar endereço - atualiza o estado e recarrega
  const handleSaveAddress = async (address: AddressData) => {
    console.log("Endereço Salvo:", address);
    setSavedAddress(address);
    // Recarrega os endereços para garantir que está sincronizado
    await fetchAddress();
  };

  const handleLogout = () => {
    clearAuthData();

    navigation.reset({
      index: 0,
      routes: [{ name: "Auth" }],
    });
  };

  // Lógica para mostrar um subtítulo resumindo o horário atual
  const getSubtitle = () => {
    if (!businessSchedule) return "Não configurado";

    const openDays = businessSchedule.filter((d) => d.isOpen);
    if (openDays.length === 0) return "Fechado Permanentemente";

    return `${openDays.length} dias abertos`;
  };

  // Lógica para mostrar o subtítulo do raio de entrega
  const getRadiusSubtitle = () => {
    return `${deliveryRadius} km`;
  };

  // Lógica para mostrar o subtítulo do endereço
  const getAddressSubtitle = () => {
    if (isLoadingAddress) return "Carregando...";
    if (!savedAddress) return "Não configurado";
    return `${savedAddress.street}, ${savedAddress.number}`;
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
              Estabelecimento
            </Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <MenuItem
              title="Horário de Funcionamento"
              subtitle={getSubtitle()}
              onPress={handleOpenModal}
              showBorder={true}
            />
            <MenuItem
              title="Número de contato"
              subtitle="(61) x xxxx-xxxx"
              onPress={() => console.log("Número de contato")}
            />
            <MenuItem
              title="Taxa de Entrega"
              subtitle="R$ 10,00, Grátis a partir de R$ 200,00"
              onPress={() => console.log("Taxa de Entrega")}
            />
            <MenuItem
              title="Raio de Entrega"
              subtitle={getRadiusSubtitle()}
              onPress={handleOpenDeliveryRadiusModal}
            />
            <MenuItem
              title="Endereço"
              subtitle={getAddressSubtitle()}
              onPress={handleOpenAddressModal}
            />
            <MenuItem title="Suporte" onPress={() => console.log("Suporte")} />
            <MenuItem title="Sair" onPress={handleLogout} showBorder={false} />
          </View>
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
          isActive={true}
          onPress={() => navigation.navigate("EstablishmentProfile")}
        />
      </View>

      <BusinessHoursModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveSchedule}
        initialSchedule={businessSchedule}
      />

      <DeliveryRadiusModal
        visible={isDeliveryRadiusModalVisible}
        onClose={handleCloseDeliveryRadiusModal}
        onSave={handleSaveDeliveryRadius}
        initialRadius={deliveryRadius}
      />

      <AddressModalEstablishment
        visible={isAddressModalVisible}
        onClose={handleCloseAddressModal}
        onSave={handleSaveAddress}
        initialAddress={savedAddress || undefined}
      />
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

export default EstablishmentProfileScreen;
