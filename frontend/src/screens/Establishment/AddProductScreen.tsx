import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ImageSourcePropType,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import { pickImage, uploadImage } from "../../services/client/ImageService";
import { getProductImageSource } from "../../utils/ProductImageMap";
import { therapeuticClass } from "../../services/establishment/therapeuticClass";
import { Produto } from "../../types";
import { registerProductToCatalog } from "../../services/establishment/catalogService";

import { getEstablishmentId } from "../../services/common/AuthService";
import Header from "../../components/common/Header";
import MaskedInput from "../../components/common/MaskedInput";
import ProductImageWithOverlay from "../../components/common/ProductImage";

const MOCK_STORE_ID = getEstablishmentId();

interface Laboratory {
  id: string;
  name: string;
}

interface Presentation {
  id: number;
  name: string;
  msRegistration: string;
  cmedPrice: number;
}

// Tipo para os itens do dropdown
interface DropdownItem {
  label: string;
  value: string;
}

// Adaptação dos Tipos de Navegação, assumindo que EstablishmentHomeScreenNavigationProps tem route/params.
interface EstablishmentHomeScreenNavigationProps {
  navigation: any; // Substitua por seu tipo de navegação real (ex: NativeStackScreenProps<RootStackParamList, 'ProductRegistrationScreen'>['navigation'])
  route: any;
}

const storeId = 0;

const ProductRegistrationScreen: React.FC<
  EstablishmentHomeScreenNavigationProps
> = ({ navigation, route }) => {
  const normalizeString = (str: string) => {
    if (!str) return "";
    return str.trim().replace(/\s\s+/g, " ");
  };

  const [priceError, setPriceError] = useState("");

  const handlePriceChange = (text: string) => {
    const sellingPrice = parseFloat(text);

    const maxPrice = formData.cmedPrice;

    setFormData((prev) => ({
      ...prev,
      sellingPrice: text,
    }));

    if (!isNaN(sellingPrice) && sellingPrice > maxPrice) {
      const formattedMaxPrice = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(maxPrice);

      setPriceError(
        `O preço de venda não pode ser maior que o Preço CMED. Valor máximo permitido: ${formattedMaxPrice}.`
      );
    } else {
      setPriceError("");
    }
  };

  const [formData, setFormData] = useState({
    therapeuticClass: "",
    name: "",
    laboratory: "",
    presentation: "",
    msRegistration: "",
    sellingPrice: "",
    cmedPrice: 0,
    tarja: "",
    forma_terapeutica: "",
    tipo_produto: "",
    idproduto: "",
  });

  const [productImageSource, setProductImageSource] = useState<
    ImageSourcePropType | undefined
  >(undefined);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Estados para os dados
  const [therapeuticClasses, setTherapeuticClasses] = useState<string[]>([]); // Armazena apenas as strings das classes

  const [isSubmitting, setIsSubmitting] = useState(false);
  // NOVO: Armazenar todos os produtos filtrados pela classe terapêutica
  const [allProducts, setAllProducts] = useState<Produto[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);

  // Estados para os dropdowns
  const [openTherapeuticClass, setOpenTherapeuticClass] = useState(false);
  const [therapeuticClassValue, setTherapeuticClassValue] = useState<
    string | null
  >(null);
  const [therapeuticClassItems, setTherapeuticClassItems] = useState<
    DropdownItem[]
  >([]);

  const [openName, setOpenName] = useState(false);
  const [nameValue, setNameValue] = useState<string | null>(null);
  const [nameItems, setNameItems] = useState<DropdownItem[]>([]);

  const [openLaboratory, setOpenLaboratory] = useState(false);
  const [laboratoryValue, setLaboratoryValue] = useState<string | null>(null);
  const [laboratoryItems, setLaboratoryItems] = useState<DropdownItem[]>([]);

  const [openPresentation, setOpenPresentation] = useState(false);
  const [presentationValue, setPresentationValue] = useState<string | null>(
    null
  );
  const [presentationItems, setPresentationItems] = useState<DropdownItem[]>(
    []
  );
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

  const formattedCmedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(formData.cmedPrice || 0);
  const priceLabel = `Preço de Venda (R$) * (CMED: ${formattedCmedPrice})`;

  const colors = {
    primary: "#007AFF",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#6C6C70",
    border: "#E5E5EA",
    grayLight: "#F2F2F7",
    white: "#FFFFFF",
  };

  // Funções de utilidade (mantidas)
  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filterItems = (
    items: DropdownItem[],
    searchText: string
  ): DropdownItem[] => {
    if (!searchText) return items;

    const normalizedSearch = normalizeText(searchText);
    return items.filter((item) =>
      normalizeText(item.label).includes(normalizedSearch)
    );
  };

  useEffect(() => {
    const loadStoreId = async () => {
      try {
        // getEstablishmentId retorna string | null. Convertemos para número.
        const idString = await getEstablishmentId();

        if (idString) {
          const idNumber = parseInt(idString, 10);
          setStoreId(idNumber); // Armazena o ID numérico correto
          console.log("ID do Estabelecimento carregado:", idNumber);
        } else {
          // Lidar com o caso de não ter ID (usuário não logado como estabelecimento)
          console.log("Nenhum ID de Estabelecimento encontrado.");
        }
      } catch (error) {
        console.error("Erro ao carregar o Store ID:", error);
        setStoreId(null);
      }
    };

    loadStoreId();
  }, []);

  useEffect(() => {
    const { tarja, forma_terapeutica, tipo_produto } = formData;

    if (tarja && forma_terapeutica && tipo_produto) {
      const source = getProductImageSource(
        tarja,
        forma_terapeutica,
        tipo_produto
      );
      setProductImageSource(source);
    } else {
      setProductImageSource(undefined);
    }
  }, [formData.tarja, formData.forma_terapeutica, formData.tipo_produto]);

  useEffect(() => {
    const loadTherapeuticClasses = async () => {
      try {
        const classObjects = await therapeuticClass.getAllTherapeuticClasses();

        const classStrings = classObjects.map((cls) => cls.classe_terapeutica);

        const sortedClassStrings = classStrings.sort((a, b) => {
          const aNormalized = a
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
          const bNormalized = b
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

          return aNormalized.localeCompare(bNormalized, "pt-BR");
        });

        setTherapeuticClasses(sortedClassStrings);

        setTherapeuticClassItems(
          sortedClassStrings.map((cls) => ({ label: cls, value: cls }))
        );
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar classes terapêuticas.");
        console.error("Erro ao carregar classes:", error);
      }
    };

    loadTherapeuticClasses();
  }, [storeId]);

  useEffect(() => {
    const loadProductsByClass = async () => {
      if (therapeuticClassValue) {
        try {
          const products = await therapeuticClass.getProductsByClass(
            storeId,
            therapeuticClassValue
          );
          setAllProducts(products);

          const uniqueProductNames = [
            ...new Set(products.map((p) => p.nome_comercial)),
          ];

          setNameItems(
            uniqueProductNames.map((name) => ({ label: name, value: name }))
          );

          setFormData((prev) => ({
            ...prev,
            therapeuticClass: therapeuticClassValue,
          }));

          setNameValue(null);
          setPresentationValue(null);
          setFormData((prev) => ({
            ...prev,
            name: "",
            presentation: "",
            msRegistration: "",
            tarja: "",
            tipo_produto: "",
          }));
        } catch (error) {
          Alert.alert(
            "Erro",
            `Falha ao carregar produtos da classe ${therapeuticClassValue}.`
          );
          console.error("Erro ao carregar produtos:", error);
          setAllProducts([]);
          setNameItems([]);
          setNameValue(null);
        }
      } else {
        setAllProducts([]);
        setNameItems([]);
        setNameValue(null);
        setFormData((prev) => ({
          ...prev,
          therapeuticClass: "",
          name: "",
          presentation: "",
          msRegistration: "",
          tarja: "",
          tipo_produto: "",
        }));
      }
    };

    loadProductsByClass();
  }, [therapeuticClassValue, storeId]);

  useEffect(() => {
    if (nameValue) {
      const productsFilteredByName = allProducts.filter(
        (p) => p.nome_comercial === nameValue
      );

      const uniqueLaboratories = [
        ...new Set(productsFilteredByName.map((p) => p.detentor_registro)),
      ];

      const newLaboratoryItems = uniqueLaboratories.map((labName) => ({
        label: labName,
        value: labName,
      }));

      setLaboratoryItems(newLaboratoryItems);

      setFormData((prev) => ({ ...prev, name: nameValue }));

      setLaboratoryValue(null);
      setPresentationValue(null);
      setFormData((prev) => ({
        ...prev,
        laboratory: "",
        presentation: "",
        msRegistration: "",
      }));
    } else {
      setLaboratoryItems([]);
      setLaboratoryValue(null);
      setPresentationValue(null);
      setFormData((prev) => ({
        ...prev,
        name: "",
        laboratory: "",
        presentation: "",
        msRegistration: "",
      }));
    }
  }, [nameValue, allProducts]);

  useEffect(() => {
    if (nameValue && laboratoryValue) {
      const filteredProducts = allProducts.filter(
        (p) =>
          p.nome_comercial === nameValue &&
          p.detentor_registro === laboratoryValue
      );

      const newPresentations = filteredProducts.map((p) => ({
        id: Number(p.idproduto),
        name: normalizeString(p.apresentacao),
        msRegistration: p.registro_anvisa,
        cmedPrice: parseFloat(p.preco_cmed) || 0,
      }));

      setPresentations(newPresentations);
      setPresentationItems(
        newPresentations.map((pres) => ({
          label: pres.name,
          value: pres.name,
        }))
      );

      setFormData((prev) => ({
        ...prev,
        name: nameValue,
        laboratory: laboratoryValue,
      }));

      setPresentationValue(null);
      setFormData((prev) => ({
        ...prev,
        presentation: "",
        msRegistration: "",
      }));
      console.log(
        "Apresentações normalizadas:",
        newPresentations.map((p) => ({
          id: p.id,
          name: p.name,
          normalized: normalizeString(p.name),
        }))
      );
    } else {
      setPresentations([]);
      setPresentationItems([]);
      setPresentationValue(null);
      setFormData((prev) => ({
        ...prev,
        presentation: "",
        msRegistration: "",
      }));
    }
  }, [nameValue, laboratoryValue, allProducts]);

  useEffect(() => {
    const cleanedPresentationValue = normalizeString(presentationValue || "");

    if (cleanedPresentationValue) {
      const selectedPresentation = presentations.find(
        (p) => normalizeString(p.name) === cleanedPresentationValue
      );
      // 🔥 ENCONTRE O PRODUTO COMPLETO PARA PEGAR TARJA E TIPO
      const selectedProduct = allProducts.find(
        (p) =>
          p.nome_comercial === nameValue &&
          p.detentor_registro === laboratoryValue &&
          normalizeString(p.apresentacao) === cleanedPresentationValue
      );

      setFormData((prev) => ({
        ...prev,
        presentation: presentationValue || "",
        msRegistration: selectedPresentation
          ? selectedPresentation.msRegistration
          : "",
        cmedPrice: selectedPresentation ? selectedPresentation.cmedPrice : 0,
        tarja: selectedProduct?.tarja || "", // 🔥 CAPTURA A TARJA
        tipo_produto: selectedProduct?.tipo_produto || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        presentation: "",
        msRegistration: "",
        cmedPrice: 0,
        tarja: "",
        tipo_produto: "",
      }));
    }
  }, [
    presentationValue,
    presentations,
    allProducts,
    nameValue,
    laboratoryValue,
  ]);

  const onPresentationChange = (callback: any) => {
    const value = typeof callback === "function" ? callback() : callback;

    console.log("Valor recebido:", value);

    setPresentationValue(value);

    const cleanedValue = normalizeString(String(value || ""));

    console.log("Valor normalizado:", cleanedValue);

    const selectedItem = presentations.find((p) => {
      const presentationNameNormalized = normalizeString(p.name);
      return presentationNameNormalized === cleanedValue;
    });

    if (selectedItem && selectedItem.id) {
      setSelectedProductId(Number(selectedItem.id));
      console.log("✅ ID do Produto Selecionado:", selectedItem.id);
      console.log("✅ Apresentação selecionada:", selectedItem.name);
    } else {
      setSelectedProductId(null);
      console.log("❌ ID do Produto Selecionado: NULL");
      console.log("❌ Valor buscado:", cleanedValue);
      console.log(
        "❌ Apresentações disponíveis:",
        presentations.map((p) => ({
          id: p.id,
          original: p.name,
          normalized: normalizeString(p.name),
        }))
      );
    }
  };

  const handleImagePick = async () => {
    try {
      const imageUri = await pickImage();
      if (imageUri) {
        setProductImage(imageUri);
        setIsUploading(true);
        await uploadImage(imageUri, "products", "1");
        setIsUploading(false);
        Alert.alert("Sucesso", "Imagem do produto enviada com sucesso!");
      }
    } catch (error) {
      setIsUploading(false);
      Alert.alert("Erro", "Falha ao enviar imagem do produto");
      console.error("Erro no upload:", error);
    }
  };

  const ImagePreviewField: React.FC = () => {
    // Crie o objeto product para o componente de imagem
    const productForImage = {
      id: selectedProductId?.toString() || "",
      nome_comercial: nameValue || "",
      apresentacao: presentationValue || "",
      substancia_ativa: "", // Você pode preencher se tiver este dado
      tarja: formData.tarja || "",
      tipo_produto: formData.tipo_produto || "",
      disponibilidade: true, // Sempre true no cadastro
    };

    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Visualização do Produto
        </Text>

        {/* Container para a imagem com tarja */}
        <View style={styles.imagePreviewContainer}>
          <ProductImageWithOverlay
            product={productForImage}
            style={styles.productImageStyle}
            imageStyle={styles.productImageInner}
          />

          {/* Overlay informativo quando não há produto selecionado */}
          {(!nameValue || !presentationValue) && (
            <View style={styles.imagePlaceholderOverlay}>
              <MaterialIcons
                name="image-search"
                size={40}
                color={colors.textSecondary}
              />
              <Text style={styles.placeholderText}>
                Preencha os campos acima para visualizar o produto
              </Text>
            </View>
          )}
        </View>

        {/* Informações adicionais sobre o produto */}
        {(nameValue || presentationValue) && (
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{nameValue}</Text>
            {presentationValue && (
              <Text style={styles.productPresentation}>
                {presentationValue}
              </Text>
            )}
            {formData.tarja && (
              <Text style={styles.productTarja}>Tarja: {formData.tarja}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const NavButton: React.FC<{
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    onPress: () => void;
  }> = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <MaterialIcons name={icon} size={24} color={colors.textSecondary} />
      <Text style={[styles.navLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const handleSubmit = async () => {
    let hasError = false;
    let newPriceError = "";

    if (!selectedProductId || selectedProductId <= 0) {
      Alert.alert(
        "Erro Crítico",
        "Não foi possível identificar o ID do Produto. Selecione a Apresentação novamente ou verifique o log."
      );
      return;
    }

    const productIdFinal = selectedProductId;

    const sellingPrice = parseFloat(formData.sellingPrice.replace(",", "."));
    const maxPrice = formData.cmedPrice;

    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      Alert.alert(
        "Erro de Preço",
        "Por favor, insira um Preço de Venda válido."
      );
      return;
    }

    if (sellingPrice > maxPrice) {
      const formattedMaxPrice = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      }).format(maxPrice);

      newPriceError = `O preço de venda não pode ser maior que o Preço CMED. Valor máximo: ${formattedMaxPrice}.`;
      hasError = true;
    }

    setPriceError(newPriceError);
    if (hasError) {
      Alert.alert("Erro no Preço", newPriceError);
      return;
    }

    const payload = {
      produto_idproduto: selectedProductId,
      catalogo_idcatalogo: Number(storeId),
      valor_venda: sellingPrice,
      disponibilidade: true,
    };

    setIsSubmitting(true);
    try {
      console.log(payload);
      const response = await registerProductToCatalog(payload);

      Alert.alert("Sucesso", "Produto registrado no catálogo com sucesso!");
      console.log("Resposta do Cadastro:", response);

      navigation.goBack();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      Alert.alert(
        "Erro de Cadastro",
        "Falha ao registrar o produto no catálogo. Verifique os dados e tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header showBackButton title="Cadastro de Produtos" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        {/* Main Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <ImagePreviewField />

            {/* Classe Terapêutica (antiga Categoria) */}
            <View style={[styles.inputContainer, { zIndex: 4000 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Classe Terapêutica *
              </Text>
              <DropDownPicker
                open={openTherapeuticClass}
                value={therapeuticClassValue}
                items={therapeuticClassItems}
                setOpen={setOpenTherapeuticClass}
                setValue={setTherapeuticClassValue}
                placeholder="Selecione a classe terapêutica"
                searchable={true}
                searchPlaceholder="Buscar classe..."
                searchTextInputStyle={styles.searchInput}
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colors.grayLight,
                    borderColor: colors.border,
                  },
                ]}
                textStyle={[
                  styles.dropdownText,
                  {
                    color: therapeuticClassValue
                      ? colors.text
                      : colors.textSecondary,
                  },
                ]}
                dropDownContainerStyle={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                  },
                ]}
                listItemLabelStyle={styles.listItemLabel}
                placeholderStyle={styles.placeholderText}
                arrowIconStyle={styles.arrowIcon}
                tickIconStyle={styles.tickIcon}
                closeOnBackPressed={true}
                modalProps={{
                  animationType: "slide",
                }}
                listMode="MODAL"
                modalTitle="Selecionar Classe Terapêutica"
                modalContentContainerStyle={styles.modalContent}
                modalTitleStyle={styles.modalTitle}
              />
            </View>

            {/* Nome do Produto */}
            <View style={[styles.inputContainer, { zIndex: 3000 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Nome do Produto *
              </Text>
              <DropDownPicker
                open={openName}
                value={nameValue}
                items={nameItems}
                setOpen={setOpenName}
                setValue={setNameValue}
                placeholder="Selecione o nome"
                disabled={!therapeuticClassValue}
                searchable={true}
                searchPlaceholder="Buscar produto..."
                searchTextInputStyle={styles.searchInput}
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colors.grayLight,
                    borderColor: colors.border,
                  },
                  !therapeuticClassValue && styles.disabled,
                ]}
                textStyle={[
                  styles.dropdownText,
                  { color: nameValue ? colors.text : colors.textSecondary },
                ]}
                dropDownContainerStyle={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                  },
                ]}
                listItemLabelStyle={styles.listItemLabel}
                placeholderStyle={styles.placeholderText}
                arrowIconStyle={styles.arrowIcon}
                tickIconStyle={styles.tickIcon}
                closeOnBackPressed={true}
                modalProps={{
                  animationType: "slide",
                }}
                listMode="MODAL"
                modalTitle="Selecionar nome do produto"
                modalContentContainerStyle={styles.modalContent}
                modalTitleStyle={styles.modalTitle}
              />
            </View>

            {/* Laboratório */}
            <View style={[styles.inputContainer, { zIndex: 2000 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Laboratório *
              </Text>
              <DropDownPicker
                open={openLaboratory}
                value={laboratoryValue}
                items={laboratoryItems}
                setOpen={setOpenLaboratory}
                setValue={setLaboratoryValue}
                placeholder="Selecione o laboratório"
                disabled={!nameValue}
                searchable={true}
                searchPlaceholder="Buscar laboratório..."
                searchTextInputStyle={styles.searchInput}
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colors.grayLight,
                    borderColor: colors.border,
                  },
                  !nameValue && styles.disabled,
                ]}
                textStyle={[
                  styles.dropdownText,
                  {
                    color: laboratoryValue ? colors.text : colors.textSecondary,
                  },
                ]}
                dropDownContainerStyle={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                  },
                ]}
                listItemLabelStyle={styles.listItemLabel}
                placeholderStyle={styles.placeholderText}
                arrowIconStyle={styles.arrowIcon}
                tickIconStyle={styles.tickIcon}
                closeOnBackPressed={true}
                modalProps={{
                  animationType: "slide",
                }}
                listMode="MODAL"
                modalTitle="Selecionar laboratório"
                modalContentContainerStyle={styles.modalContent}
                modalTitleStyle={styles.modalTitle}
              />
            </View>

            {/* Apresentação */}
            <View style={[styles.inputContainer, { zIndex: 1000 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Apresentação *
              </Text>
              <DropDownPicker
                open={openPresentation}
                value={presentationValue}
                items={presentationItems}
                setOpen={setOpenPresentation}
                setValue={onPresentationChange}
                placeholder="Selecione a apresentação"
                disabled={!laboratoryValue}
                searchable={true}
                searchPlaceholder="Buscar apresentação..."
                searchTextInputStyle={styles.searchInput}
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colors.grayLight,
                    borderColor: colors.border,
                  },
                  !laboratoryValue && styles.disabled,
                ]}
                textStyle={[
                  styles.dropdownText,
                  {
                    color: presentationValue
                      ? colors.text
                      : colors.textSecondary,
                  },
                ]}
                dropDownContainerStyle={[
                  styles.dropdownContainer,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                  },
                ]}
                listItemLabelStyle={styles.listItemLabel}
                placeholderStyle={styles.placeholderText}
                arrowIconStyle={styles.arrowIcon}
                tickIconStyle={styles.tickIcon}
                closeOnBackPressed={true}
                modalProps={{
                  animationType: "slide",
                }}
                listMode="MODAL"
                modalTitle="Selecionar apresentação"
                modalContentContainerStyle={styles.modalContent}
                modalTitleStyle={styles.modalTitle}
              />
            </View>

            {/* Campo Registro MS (somente leitura) */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Registro MS
              </Text>
              <View
                style={[
                  styles.readOnlyField,
                  { backgroundColor: colors.grayLight },
                ]}
              >
                <Text style={[styles.readOnlyText, { color: colors.text }]}>
                  {formData.msRegistration || "Preencha a apresentação"}
                </Text>
              </View>
            </View>

            {/* Campo Valor */}
            <View style={styles.inputContainer}>
              <MaskedInput
                label={priceLabel}
                placeholder="R$ 0,00"
                maskType="brl"
                value={formData.sellingPrice}
                onChangeText={handlePriceChange}
                error={priceError}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={isSubmitting || !!priceError}
            >
              <Text style={styles.submitButtonText}>
                {isUploading ? "Enviando..." : "Cadastrar Produto"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Footer Navigation (Mantida) */}
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
          onPress={() => navigation.navigate("EstablishmentProfile")}
        />
      </View>
    </SafeAreaView>
  );
};

// Estilos (Mantidos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
  },
  listItemLabel: {
    fontSize: 16,
    color: "#000000",
  },
  searchInput: {
    fontSize: 16,
    color: "#000000",
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  tickIcon: {
    width: 20,
    height: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  readOnlyField: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  readOnlyText: {
    fontSize: 16,
  },
  imageUploadButton: {
    height: 150,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#d9534f",
    borderWidth: 2,
  },
  errorText: {
    color: "#d9534f",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    fontWeight: "500",
  },
  // NOVOS ESTILOS PARA A VISUALIZAÇÃO DA IMAGEM:
  imagePreviewContainer: {
    height: 200,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    marginBottom: 8,
  },

  productImageStyle: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },

  productImageInner: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(243, 244, 246, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6C6C70",
    textAlign: "center",
    paddingHorizontal: 16,
  },

  productInfo: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },

  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },

  productPresentation: {
    fontSize: 14,
    color: "#6C6C70",
    marginBottom: 2,
  },

  productTarja: {
    fontSize: 12,
    color: "#8B0000",
    fontWeight: "500",
  },
});

export default ProductRegistrationScreen;
