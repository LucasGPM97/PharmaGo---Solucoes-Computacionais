import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import {
  getEnderecosByCliente,
  deleteEnderecoCliente,
  AddressData,
} from "../../services/client/ClientAddressService";
import AddressModalCliente from "../../components/client/AddressModalClient";
import Header from "../../components/common/Header";

const { width: screenWidth } = Dimensions.get("window");

type Address = {
  id: string;
  title: string;
  address: string;
  details: string;
  isCurrentLocation: boolean;
  isSelected: boolean;
  addressData?: AddressData;
};

type AddressManagementProps = {
  navigation: any;
};

const AddressManagement: React.FC<AddressManagementProps> = ({
  navigation,
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(
    undefined
  );

  // Carregar endereços do cliente
  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const enderecos = await getEnderecosByCliente();

      const formattedAddresses: Address[] = enderecos.map(
        (endereco, index) => ({
          id: `db_${endereco.idendereco_cliente}`,
          title:
            endereco.addressName || `${endereco.street}, ${endereco.number}`,
          address: `${endereco.street}, ${endereco.number}`,
          fullAddress: `${endereco.neighborhood}, ${endereco.city} - ${endereco.state}`,
          details: endereco.complement || "",
          isCurrentLocation: false,
          isSelected: false, // Não há seleção no modo de gerenciamento
          addressData: endereco,
        })
      );

      setAddresses(formattedAddresses);
    } catch (error) {
      console.error("Erro ao carregar endereços do cliente:", error);
      Alert.alert("Erro", "Não foi possível carregar seus endereços");
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar localização atual
  const getCurrentLocation = async () => {
    try {
      setIsLocationLoading(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;

      let addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];

        // 1. Extração e Tratamento dos Dados
        const stateName = address.region || "Estado Desconhecido";
        const ufCode = getUFFromStateName(stateName);

        // 2. Definindo a cidade/bairro (Subregion/District)
        const cityValue =
          address.subregion || address.city || "Cidade Desconhecida";
        const neighborhoodValue = address.district || "";
        
        // Novo campo para usar como endereço principal, já que 'street' é null
        const primaryAddressLine = address.formattedAddress || address.name || "Localização atual";
        
        // Tenta usar o número, senão usa S/N
        const streetNumberValue = address.streetNumber || "S/N";

        // Cria o AddressData COMPLETO
        const locationAddressData: AddressData = {
          cep: address.postalCode || "00000000",
          street: address.street || primaryAddressLine, // Usa a linha formatada se a rua for null
          number: streetNumberValue,
          neighborhood: neighborhoodValue,
          city: cityValue,
          state: stateName,
          uf: ufCode,
          complement: "",
          addressName: MANAGE_LOCATION_NAME,
          latitude: String(latitude),
          longitude: String(longitude),
        };

        // Cria a estrutura de exibição na UI
        const formattedAddress: Address = {
          id: "current_location_temp", // ID temporário
          title: MANAGE_LOCATION_NAME,
          // Se a rua veio como null, mostra a linha formatada
          address: (address.street && address.streetNumber)
              ? `${address.street}, ${address.streetNumber}`
              : primaryAddressLine, // <-- USA A LINHA COMPLETA/NOME AQUI
          fullAddress: `${locationAddressData.neighborhood}, ${locationAddressData.city} - ${locationAddressData.state}`,
          details: locationAddressData.complement || "",
          isCurrentLocation: true,
          isSelected: false,
          addressData: locationAddressData,
        };

        setCurrentLocation(formattedAddress);

        setAddresses((prev) => {
          const filtered = prev.filter(
            (addr) => addr.id !== "current_location"
          );
          return [formattedAddress, ...filtered];
        });
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error);
    } finally {
      setIsLocationLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    getCurrentLocation();
  }, []);

  // Adicionar novo endereço
  const addNewAddress = () => {
    setEditingAddress(undefined);
    setIsAddressModalVisible(true);
  };

  // Editar endereço existente
  const editAddress = (address: Address) => {
    if (address.addressData) {
      setEditingAddress(address);
      setIsAddressModalVisible(true);
    }
  };

  // Remover endereço
  const removeAddress = async (address: Address) => {
    if (address.isCurrentLocation) {
      Alert.alert("Aviso", "Não é possível remover a localização atual");
      return;
    }

    Alert.alert(
      "Remover Endereço",
      `Tem certeza que deseja remover o endereço "${address.title}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              if (address.addressData?.idendereco_cliente) {
                await deleteEnderecoCliente(
                  address.addressData.idendereco_cliente
                );
                await loadAddresses(); // Recarrega a lista
                Alert.alert("Sucesso", "Endereço removido com sucesso!");
              }
            } catch (error) {
              console.error("Erro ao remover endereço:", error);
              Alert.alert("Erro", "Não foi possível remover o endereço");
            }
          },
        },
      ]
    );
  };

  // Salvar endereço (novo ou editado)
  const handleSaveAddress = (savedAddress: AddressData) => {
    console.log("Endereço salvo:", savedAddress);

    loadAddresses(); // Recarrega a lista completa
    setIsAddressModalVisible(false);
    setEditingAddress(undefined);

    Alert.alert(
      "Sucesso",
      editingAddress
        ? "Endereço atualizado com sucesso!"
        : "Endereço salvo com sucesso!"
    );
  };

  // Voltar
  const goBack = () => {
    navigation.goBack();
  };

  // Atualizar localização
  const refreshLocation = () => {
    getCurrentLocation();
  };

  const renderAddressCard = (address: Address) => (
    // Use TouchableOpacity para tornar todo o card clicável
    // Adicione um estilo para feedback visual ao tocar (opcional)
    <TouchableOpacity
      key={address.id}
      style={[
        styles.addressCard,
        address.isCurrentLocation
          ? styles.currentLocationCard
          : styles.regularAddressCard,
      ]}
      // **CHAMADA PRINCIPAL PARA ABRIR O MODAL**
      onPress={() => editAddress(address)} // <--- Assumindo que esta função existe
      activeOpacity={0.8} // Opcional: Define a opacidade ao tocar
    >
      <View style={styles.cardContentWrapper}>
        <MaterialIcons
          name={address.isCurrentLocation ? "my-location" : "home"}
          size={24}
          color={address.isCurrentLocation ? "#007AFF" : "#6B7280"}
          style={styles.addressIcon}
        />

        <View style={styles.addressInfo}>
          <Text
            style={[
              styles.addressTitle,
              address.isCurrentLocation
                ? styles.currentLocationTitle
                : styles.regularAddressTitle,
            ]}
          >
            {address.title}
          </Text>
          <Text
            style={[
              styles.addressDetails,
              address.isCurrentLocation
                ? styles.currentLocationDetails
                : styles.regularAddressDetails,
            ]}
          >
            {address.address}
          </Text>
          {address.details ? (
            <Text style={styles.addressComplement}>{address.details}</Text>
          ) : null}
        </View>

        <View style={styles.addressControls}>
          {address.isCurrentLocation && isLocationLoading && (
            <ActivityIndicator size="small" color="#007AFF" />
          )}

          {/* Mantendo o botão de "Excluir" separado */}
          {!address.isCurrentLocation && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation(); // Previne que o toque suba e acione o onPress do card
                removeAddress(address); // Ação de exclusão separada
              }}
            >
              <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAddAddressButton = () => (
    <TouchableOpacity style={styles.addAddressButton} onPress={addNewAddress}>
      <MaterialIcons name="add" size={28} color="#007AFF" />
      <Text style={styles.addAddressText}>Adicionar novo endereço</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="location-off" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Nenhum endereço cadastrado</Text>
      <Text style={styles.emptyDescription}>
        Adicione seus endereços para facilitar futuros pedidos
      </Text>
    </View>
  );

  if (isLoading && addresses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header showBackButton title="Meus Endereços" />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando seus endereços...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header showBackButton title="Meus Endereços" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Meus endereços salvos</Text>

        {addresses.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {addresses.map(renderAddressCard)}
            <View style={styles.divider} />
            {renderAddAddressButton()}
          </>
        )}
      </ScrollView>

      {/* Modal para adicionar/editar endereço do cliente */}
      <AddressModalCliente
        visible={isAddressModalVisible}
        onClose={() => {
          setIsAddressModalVisible(false);
          setEditingAddress(undefined);
        }}
        onSave={handleSaveAddress}
        initialAddress={editingAddress?.addressData}
        isEditing={!!editingAddress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButton: {
    padding: 4,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 100,
  },
  currentLocationCard: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderColor: "#E5E7EB",
  },
  regularAddressCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  addressIcon: {
    marginRight: 16,
    marginTop: 2,
    alignSelf: "center",
  },
  addressInfo: {
    flex: 1,
    gap: 4,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  currentLocationTitle: {
    color: "#007AFF",
    fontWeight: "600",
  },
  regularAddressTitle: {
    color: "#1F2937",
  },
  addressDetails: {
    fontSize: 14,
    lineHeight: 18,
  },
  currentLocationDetails: {
    color: "#6B7280",
  },
  regularAddressDetails: {
    color: "#6B7280",
  },
  addressComplement: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  addressActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 16,
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  addressControls: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    alignSelf: "center",
  },
  deleteButton: {
    padding: 4,
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 12,
    borderStyle: "dashed",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  cardContentWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
});

export default AddressManagement;
