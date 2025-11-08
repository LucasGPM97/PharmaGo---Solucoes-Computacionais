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

// 1. IMPORTAÇÕES CHAVE
import {
  getEnderecosByCliente,
  AddressData,
  manageCurrentLocationAddress,
  MANAGE_LOCATION_NAME,
} from "../../services/client/ClientAddressService";

import AddressModalCliente from "../../components/client/AddressModalClient";
import { useNavigation, useRoute } from "@react-navigation/native";
import Header from "../../components/common/Header";

const { width: screenWidth } = Dimensions.get("window");

// 2. DEFINIÇÕES DE TIPOS
type Address = {
  id: string;
  title: string;
  address: string;
  fullAddress: string;
  details: string;
  isCurrentLocation: boolean;
  isSelected: boolean;
  addressData?: AddressData;
};

type DeliveryAddressProps = {
  navigation: any;
};
const stateToUFMap: { [key: string]: string } = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO", // <-- Mapeamento principal
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

// Função auxiliar para obter a sigla UF
const getUFFromStateName = (stateName: string | null | undefined): string => {
  if (!stateName) return "XX"; // Fallback para "Desconhecido"

  // Normaliza (remove acentos, caixa baixa) para garantir a correspondência
  const normalizedName = stateName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // Procura no mapa, se não encontrar, usa 'XX'
  return stateToUFMap[stateName.trim()] || "XX";
};

const DeliveryAddress: React.FC<DeliveryAddressProps> = ({ navigation }) => {
  const route = useRoute();
  const { cartTotal } = route.params || {};
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);

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
          isCurrentLocation: endereco.addressName === MANAGE_LOCATION_NAME, // Identifica se é o endereço fixo
          isSelected: false,
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

  // 3. FUNÇÃO getCurrentLocation (Busca localização e armazena dados completos temporariamente)
  const getCurrentLocation = async () => {
    try {
      setIsLocationLoading(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão de localização",
          "Precisamos da sua localização para encontrar endereços próximos",
          [{ text: "OK" }]
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      console.log("Latitude:", latitude, "Longitude:", longitude);
      let addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      // 🚨 PONTO DE INSPEÇÃO CHAVE: Aqui você vê o objeto completo 🚨
      console.log("--- DADOS DE LOCALIZAÇÃO (Raw Response) ---");
      if (addressResponse.length > 0) {
        // Log do primeiro item da resposta (o mais relevante)
        console.log(
          "Objeto de Endereço Geocodificado (addressResponse[0]):",
          addressResponse[0]
        );
      } else {
        console.log("Nenhuma resposta de geocodificação encontrada.");
      }
      console.log("-------------------------------------------");
      // -------------------------------------------------------------

      if (addressResponse.length > 0) {
        const address = addressResponse[0];

        // 1. Extração e Tratamento dos Dados
        const stateName = address.region || "Estado Desconhecido";
        const ufCode = getUFFromStateName(stateName); // <-- Aqui! 'Goiás' -> 'GO'

        // 2. Definindo a cidade/bairro (Subregion/District)
        // O Expo no Brasil frequentemente coloca a cidade em 'subregion' e o bairro em 'district'.
        const cityValue =
          address.subregion || address.city || "Cidade Desconhecida";
        const neighborhoodValue = address.district || "";

        // Cria o AddressData COMPLETO
        const locationAddressData: AddressData = {
          cep: address.postalCode || "00000000",
          street: address.street || "Localização atual",
          number: address.streetNumber || "S/N",
          neighborhood: neighborhoodValue, // 'Residencial Buritis'
          city: cityValue, // 'Senador Canedo' (Melhor que 'null')
          state: stateName, // 'Goiás' (Nome completo, se o DB tiver campo 'estado')
          // >>> AJUSTE CRÍTICO: Usa a sigla de 2 letras
          uf: ufCode, // 'GO'
          complement: "",
          addressName: MANAGE_LOCATION_NAME,
          latitude: String(latitude),
          longitude: String(longitude),
        };

        // Cria a estrutura de exibição na UI
        const formattedAddress: Address = {
          id: "current_location_temp", // ID temporário
          title: MANAGE_LOCATION_NAME,
          address: `${locationAddressData.street}, ${locationAddressData.number}`,
          fullAddress: `${locationAddressData.neighborhood}, ${locationAddressData.city} - ${locationAddressData.state}`,
          details: locationAddressData.complement || "",
          isCurrentLocation: true,
          isSelected: false, // Não seleciona automaticamente ao carregar/atualizar
          addressData: locationAddressData,
        };

        // Filtra e insere a localização atual (no topo)
        setAddresses((prev) => {
          const filtered = prev.filter(
            (addr) =>
              addr.id !== "current_location_temp" &&
              addr.title !== MANAGE_LOCATION_NAME
          );
          return [formattedAddress, ...filtered];
        });
      }
    } catch (error) {
      console.error("Erro ao obter localização:", error);
      Alert.alert("Erro", "Não foi possível obter sua localização atual");
    } finally {
      setIsLocationLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
    getCurrentLocation();
  }, []);

  // Funções de UI (selectAddress, addNewAddress, handleSaveAddress, goBack, refreshLocation, editAddress)
  const selectAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((address) => ({
        ...address,
        isSelected: address.id === id,
      }))
    );
  };

  const addNewAddress = () => {
    setIsAddressModalVisible(true);
  };

  const handleSaveAddress = (newAddress: AddressData) => {
    console.log("Novo endereço cliente salvo:", newAddress);

    const formattedAddress: Address = {
      id: `db_${newAddress.idendereco_cliente}`,
      title:
        newAddress.addressName || `${newAddress.street}, ${newAddress.number}`,
      address: `${newAddress.street}, ${newAddress.number}`,
      fullAddress: `${newAddress.neighborhood}, ${newAddress.city} - ${newAddress.state}`,
      details: newAddress.complement || "",
      isCurrentLocation: false,
      isSelected: true,
      addressData: newAddress,
    };

    setAddresses((prev) =>
      prev
        .map((addr) => ({ ...addr, isSelected: false }))
        .concat(formattedAddress)
    );

    setIsAddressModalVisible(false);
    Alert.alert("Sucesso", "Endereço salvo com sucesso!");
  };

  const goBack = () => {
    navigation.goBack();
  };

  const refreshLocation = () => {
    getCurrentLocation();
  };

  const editAddress = (address: Address) => {
    if (address.addressData) {
      // Lógica para abrir modal de edição (você pode implementar aqui)
      selectAddress(address.id);
    }
  };

  // 4. FUNÇÃO proceedToNext (Lógica de Persistência Condicional)
  const proceedToNext = async () => {
    const selectedAddress = addresses.find((addr) => addr.isSelected);

    if (!selectedAddress) {
      Alert.alert("Atenção", "Por favor, selecione um endereço de entrega");
      return;
    }

    let finalAddressToSend = selectedAddress.addressData;

    // Se o endereço for a "Localização Atual"
    if (selectedAddress.isCurrentLocation) {
      if (!selectedAddress.addressData) {
        Alert.alert(
          "Erro",
          "Dados de localização não disponíveis. Tente atualizar."
        );
        return;
      }

      try {
        // Garante que o usuário veja que a localização está sendo processada
        Alert.alert("Processando", "Salvando sua localização atual...");

        // Chama a função do service para CRIAR/ATUALIZAR no DB
        const managedAddress = await manageCurrentLocationAddress(
          selectedAddress.addressData
        );

        // Recebe o AddressData com o ID numérico preenchido
        finalAddressToSend = managedAddress;

        // Atualiza a UI para refletir o endereço agora salvo no DB (Opcional, mas útil)
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === selectedAddress.id
              ? {
                  ...addr,
                  id: `db_${managedAddress.idendereco_cliente}`,
                  addressData: managedAddress,
                }
              : addr
          )
        );
      } catch (error) {
        console.error("Erro ao salvar localização atual:", error);
        Alert.alert(
          "Erro",
          "Não foi possível salvar a localização atual para o pedido. Tente novamente."
        );
        return;
      }
    }

    console.log("Endereço selecionado para envio:", finalAddressToSend);

    // Navega para o resumo do pedido com o AddressData final (contendo o ID numérico)
    navigation.navigate("ConfirmPayment", {
      selectedAddress: {
        ...selectedAddress,
        addressData: finalAddressToSend, // Garante que o ID numérico será enviado
      },
      cartTotal: cartTotal,
    });
  };

  // Componentes de Renderização (Header, Card, Button, Footer)

  const renderAddressCard = (address: Address) => (
    <TouchableOpacity
      key={address.id}
      style={[
        styles.addressCard,
        address.isCurrentLocation
          ? styles.currentLocationCard
          : styles.regularAddressCard,
        address.isSelected && styles.selectedCard,
      ]}
      onPress={() => selectAddress(address.id)}
      onLongPress={() => !address.isCurrentLocation && editAddress(address)}
    >
      <MaterialIcons
        name={
          address.isCurrentLocation || address.title === MANAGE_LOCATION_NAME
            ? "my-location"
            : "home"
        }
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
          {address.isCurrentLocation ? "Localização Atual" : address.title}
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

        {!address.isCurrentLocation && (
          <Text style={styles.editHint}>(Pressione e segure para editar)</Text>
        )}
      </View>

      {address.isSelected && (
        <MaterialIcons name="check-circle" size={24} color="#007AFF" />
      )}

      {address.isCurrentLocation && isLocationLoading && (
        <ActivityIndicator
          size="small"
          color="#007AFF"
          style={styles.locationLoading}
        />
      )}
    </TouchableOpacity>
  );

  const renderAddAddressButton = () => (
    <TouchableOpacity style={styles.addAddressButton} onPress={addNewAddress}>
      <MaterialIcons name="add" size={28} color="#007AFF" />
      <Text style={styles.addAddressText}>Adicionar novo endereço</Text>
    </TouchableOpacity>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[
          styles.proceedButton,
          !addresses.some((addr) => addr.isSelected) &&
            styles.proceedButtonDisabled,
        ]}
        onPress={proceedToNext}
        disabled={!addresses.some((addr) => addr.isSelected)}
      >
        <Text style={styles.proceedButtonText}>
          Continuar com o endereço selecionado
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && addresses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Endereço de Entrega"
          showBackButton={true}
          customRightComponent={
            <TouchableOpacity
              onPress={refreshLocation}
              style={styles.refreshButton || { padding: 8 }}
            >
              <MaterialIcons name="refresh" size={24} color="#007AFF" />
            </TouchableOpacity>
          }
        />
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
      <Header
        title="Endereço de Entrega"
        showBackButton={true}
        customRightComponent={
          <TouchableOpacity
            onPress={refreshLocation}
            style={styles.refreshButton || { padding: 8 }}
          >
            <MaterialIcons name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Selecione o endereço de entrega</Text>

        {addresses.map(renderAddressCard)}

        <View style={styles.divider} />

        {renderAddAddressButton()}
      </ScrollView>

      {renderFooter()}

      {/* Modal para adicionar endereço do cliente */}
      <AddressModalCliente
        visible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        onSave={handleSaveAddress}
        initialAddress={undefined}
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
    minHeight: 80,
  },
  currentLocationCard: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderColor: "#007AFF",
  },
  regularAddressCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  selectedCard: {
    borderColor: "#007AFF",
    borderWidth: 2,
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
  editHint: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
  },
  locationLoading: {
    marginLeft: 8,
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
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  proceedButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  proceedButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
});

export default DeliveryAddress;
