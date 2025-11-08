import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import DropDownPicker from "react-native-dropdown-picker";
import MaskedInput from "../../components/common/MaskedInput";
import {
  getCatalogProducts,
  updateCatalogItem,
  deleteCatalogItem,
} from "../../services/establishment/catalogService";
import Header from "../../components/common/Header";
import ProductImageWithOverlay from "../../components/common/ProductImage";

interface Product {
  idcatalogoProduto: string;
  idproduto: string;
  nome: string;
  detentor_registro: string;
  classe_terapeutica: string;
  registro_anvisa: string;
  link_bula?: string;
  preco_cmed?: string;
  substancia_ativa: string;
  disponibilidade: boolean;
  valor_venda_display: string;
  valor_venda_numerico: number;
  isExpanded?: boolean;
  isEditing?: boolean;
  tarja?: string;
  tipo_produto?: string;
  apresentacao?: string;
}

type EstablishmentHomeScreenNavigationProps = any;

const ManageProductsScreen: React.FC<
  EstablishmentHomeScreenNavigationProps
> = ({ navigation }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openCategory, setOpenCategory] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string | null>(null);

  const [openLaboratory, setOpenLaboratory] = useState(false);
  const [laboratoryValue, setLaboratoryValue] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");

  const colors = {
    primary: "#007AFF",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#6B7280",
    border: "#E5E5EA",
    grayLight: "#F2F2F7",
    white: "#FFFFFF",
  };

  const categoryItems = useMemo(() => {
    const productsToFilter = laboratoryValue
      ? allProducts.filter((p) => p.detentor_registro === laboratoryValue)
      : allProducts;

    const uniqueCategories = Array.from(
      new Set(productsToFilter.map((p) => p.classe_terapeutica).filter(Boolean))
    );

    if (categoryValue && !uniqueCategories.includes(categoryValue)) {
      uniqueCategories.push(categoryValue);
    }

    return uniqueCategories.map((cat) => ({ label: cat, value: cat }));
  }, [allProducts, laboratoryValue, categoryValue]);

  const laboratoryItems = useMemo(() => {
    const productsToFilter = categoryValue
      ? allProducts.filter((p) => p.classe_terapeutica === categoryValue)
      : allProducts;

    const uniqueLaboratories = Array.from(
      new Set(productsToFilter.map((p) => p.detentor_registro).filter(Boolean))
    );

    if (laboratoryValue && !uniqueLaboratories.includes(laboratoryValue)) {
      uniqueLaboratories.push(laboratoryValue);
    }

    return uniqueLaboratories.map((lab) => ({ label: lab, value: lab }));
  }, [allProducts, categoryValue, laboratoryValue]);

  const handleCategoryValueChange = (
    callback: (value: string | null) => string | null
  ) => {
    setCategoryValue(callback);
  };

  const handleLaboratoryValueChange = (
    callback: (value: string | null) => string | null
  ) => {
    setLaboratoryValue(callback);
  };

  const navigateToAddProduct = () => {
    navigation.navigate("AddProduct");
  };

  const clearFilters = () => {
    setSearchText("");
    setCategoryValue(null);
    setLaboratoryValue(null);
  };

  const normalizeText = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const AddProductComponent = () => (
    <TouchableOpacity
      onPress={navigateToAddProduct}
      style={styles.addProductButton}
    >
      <MaterialIcons name="add" size={24} color="black" />
    </TouchableOpacity>
  );

  const toggleProductExpansion = (productId: string) => {
    setAllProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.idcatalogoProduto === productId
          ? { ...product, isExpanded: !product.isExpanded, isEditing: false }
          : { ...product, isEditing: false }
      )
    );
  };

  const toggleEditMode = (productId: string) => {
    setAllProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.idcatalogoProduto === productId
          ? { ...product, isEditing: !product.isEditing }
          : product
      )
    );
  };

  const toggleAvailability = (productId: string) => {
    setAllProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.idcatalogoProduto === productId
          ? { ...product, disponibilidade: !product.disponibilidade }
          : product
      )
    );
  };

  const saveProductChanges = async (
    productId: string,
    newValorVenda: number
  ) => {
    const productToUpdate = allProducts.find(
      (p) => p.idcatalogoProduto === productId
    );

    if (!productToUpdate) return;

    const rawCmed =
      productToUpdate.preco_cmed?.replace("R$ ", "").replace(",", ".") || "0";
    const precoCmedNumerico = parseFloat(rawCmed) || 0;

    if (newValorVenda > precoCmedNumerico) {
      Alert.alert(
        "Erro de Preço",
        `O valor de venda (R$ ${newValorVenda
          .toFixed(2)
          .replace(
            ".",
            ","
          )}) não pode ser maior que o Preço CMED (R$ ${precoCmedNumerico
          .toFixed(2)
          .replace(".", ",")}).`,
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await updateCatalogItem(productId, {
        valor_venda: newValorVenda,
        disponibilidade: productToUpdate.disponibilidade,
      });

      setAllProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.idcatalogoProduto === productId
            ? {
                ...product,
                isEditing: false,
                valor_venda_numerico: newValorVenda,
                valor_venda_display: `R$ ${newValorVenda
                  .toFixed(2)
                  .replace(".", ",")}`,
              }
            : product
        )
      );
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        "Falha ao salvar. Verifique os dados.";
      Alert.alert("Erro ao Salvar", errorMessage, [{ text: "OK" }]);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = allProducts.find(
      (p) => p.idcatalogoProduto === productId
    );
    if (!productToDelete) return;

    Alert.alert(
      "Confirmação de Exclusão",
      `Tem certeza que deseja remover "${productToDelete.nome}" do catálogo?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          onPress: () => confirmDelete(productId),
          style: "destructive",
        },
      ]
    );
  };

  const confirmDelete = async (productId: string) => {
    try {
      await deleteCatalogItem(productId);
      setAllProducts((prevProducts) =>
        prevProducts.filter((p) => p.idcatalogoProduto !== productId)
      );
    } catch (error) {
      console.error("Falha ao deletar produto:", error);
      Alert.alert(
        "Erro",
        "Não foi possível remover o produto. Tente novamente."
      );
    }
  };

  const handleOpenBula = async (url: string | undefined) => {
    if (!url) {
      alert("Link da bula não encontrado para este produto.");
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert(`Não foi possível abrir a bula. Link: ${url}`);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getCatalogProducts();
        const products = productsData.map((p) => ({
          ...p,
          isExpanded: false,
          isEditing: false,
          tarja: p.tarja || "Sem Tarja",
          tipo_produto: p.tipo_produto || "Medicamento",
          apresentacao: p.apresentacao || p.substancia_ativa,
        }));
        setAllProducts(products);
      } catch (err) {
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearchText = normalizeText(searchText);

    return allProducts.filter((product) => {
      const matchesCategory =
        !categoryValue || product.classe_terapeutica === categoryValue;
      const matchesLaboratory =
        !laboratoryValue || product.detentor_registro === laboratoryValue;

      if (!normalizedSearchText) return matchesCategory && matchesLaboratory;

      const fieldsToSearch = [
        product.nome,
        product.registro_anvisa,
        product.substancia_ativa,
        product.detentor_registro,
        product.classe_terapeutica,
      ];

      const matchesSearch = fieldsToSearch.some((field) =>
        field ? normalizeText(field).includes(normalizedSearchText) : false
      );

      return matchesSearch && matchesCategory && matchesLaboratory;
    });
  }, [allProducts, categoryValue, laboratoryValue, searchText]);

  // Componente ProductCard
  const ProductCard: React.FC<{
    product: Product;
    toggleProductExpansion: (id: string) => void;
    toggleEditMode: (id: string) => void;
    toggleAvailability: (id: string) => void;
    saveProductChanges: (id: string, price: number) => void;
    handleDeleteProduct: (id: string) => void;
  }> = ({
    product,
    toggleProductExpansion,
    toggleEditMode,
    toggleAvailability,
    saveProductChanges,
    handleDeleteProduct,
  }) => {
    const [currentPrice, setCurrentPrice] = useState<number>(
      product.valor_venda_numerico
    );
    const [localPriceError, setLocalPriceError] = useState<string>("");
    const [priceString, setPriceString] = useState(
      product.valor_venda_numerico > 0
        ? product.valor_venda_numerico.toFixed(2).replace(".", ",")
        : ""
    );

    useEffect(() => {
      if (product.isEditing) {
        setCurrentPrice(product.valor_venda_numerico);
        setLocalPriceError("");
        setPriceString(
          product.valor_venda_numerico > 0
            ? product.valor_venda_numerico.toFixed(2).replace(".", ",")
            : ""
        );
      }
    }, [product.isEditing, product.valor_venda_numerico]);

    // Objeto product para o componente de imagem
    const productForImage = {
      id: product.idproduto || product.idcatalogoProduto,
      nome_comercial: product.nome,
      apresentacao: product.apresentacao || product.substancia_ativa,
      substancia_ativa: product.substancia_ativa,
      tarja: product.tarja || "Sem Tarja",
      tipo_produto: product.tipo_produto || "Medicamento",
      disponibilidade: product.disponibilidade,
    };

    const handlePriceChange = (text: string) => {
      console.log("Texto recebido:", text);
      setPriceString(text);

      const numericValue = parseFloat(text.replace(",", ".")) || 0;
      const rawCmed =
        product.preco_cmed?.replace("R$ ", "").replace(",", ".") || "0";
      const precoCmedNumerico = parseFloat(rawCmed) || 0;

      if (numericValue > precoCmedNumerico) {
        setLocalPriceError(
          `CMED = R$ ${precoCmedNumerico.toFixed(2).replace(".", ",")}`
        );
      } else {
        setLocalPriceError("");
      }
    };

    const handleSave = () => {
      if (localPriceError) {
        Alert.alert(
          "Atenção",
          "Corrija o preço (abaixo do CMED) antes de salvar."
        );
        return;
      }

      const numericValue = parseFloat(priceString.replace(",", ".")) || 0;
      console.log("Salvando valor:", numericValue);

      saveProductChanges(product.idcatalogoProduto, numericValue);
    };

    const handleCancel = () => {
      setCurrentPrice(product.valor_venda_numerico);
      setLocalPriceError("");
      toggleEditMode(product.idcatalogoProduto);
    };

    return (
      <View style={[styles.productCard, { backgroundColor: colors.grayLight }]}>
        <TouchableOpacity
          style={styles.productHeader}
          onPress={() =>
            !product.isEditing &&
            toggleProductExpansion(product.idcatalogoProduto)
          }
          activeOpacity={0.7}
        >
          {/* Componente de imagem com tarja */}
          <View style={styles.productImageContainer}>
            <ProductImageWithOverlay
              product={productForImage}
              style={styles.productImageStyle}
              imageStyle={styles.productImageInner}
            />
          </View>

          <View style={styles.productInfo}>
            <View style={styles.productTitleRow}>
              <View style={styles.productDetails}>
                <Text
                  style={[styles.productName, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {product.nome.toUpperCase()}
                </Text>
                <View style={styles.productMeta}>
                  <Text
                    style={[styles.productLab, { color: colors.textSecondary }]}
                  >
                    {product.detentor_registro}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.productCategory,
                    { color: colors.textSecondary },
                  ]}
                >
                  {product.classe_terapeutica}
                </Text>
                <Text
                  style={[styles.productReg, { color: colors.textSecondary }]}
                >
                  {product.registro_anvisa}
                </Text>
              </View>

              <View style={styles.priceBlockContainer}>
                {product.isEditing ? (
                  <MaskedInput
                    label="Preço de venda"
                    placeholder="R$ 0,00"
                    maskType="brl"
                    value={priceString.toString()}
                    onChangeText={handlePriceChange}
                    error={localPriceError}
                  />
                ) : (
                  <Text style={[styles.productPrice, { color: colors.text }]}>
                    {product.valor_venda_display}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {product.isExpanded && (
          <>
            <View style={[styles.divider, { borderTopColor: colors.border }]} />

            <View style={styles.productDetailsSection}>
              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Classe Terapêutica
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {product.classe_terapeutica}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Preço CMED
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {product.preco_cmed}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Substância Ativa
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {product.substancia_ativa}
                </Text>
              </View>
              {product.tarja && (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Tarja
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.tarja}
                  </Text>
                </View>
              )}
              {product.tipo_produto && (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Tipo
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {product.tipo_produto}
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.divider, { borderTopColor: colors.border }]} />

            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.bulaButton}
                onPress={() => handleOpenBula(product.link_bula)}
              >
                <MaterialIcons name="link" size={20} color={colors.primary} />
                <Text style={[styles.bulaText, { color: colors.primary }]}>
                  Bula
                </Text>
              </TouchableOpacity>

              <View style={styles.availabilityContainer}>
                <Text
                  style={[
                    styles.availabilityText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Disponibilidade
                </Text>
                <Switch
                  value={product.disponibilidade}
                  onValueChange={() =>
                    toggleAvailability(product.idcatalogoProduto)
                  }
                  disabled={!product.isEditing}
                  trackColor={{ false: "#D1D5DB", true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>

              <View style={styles.actionButtons}>
                {product.isEditing ? (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        localPriceError && styles.actionButtonDisabled,
                      ]}
                      onPress={handleSave}
                      disabled={!!localPriceError}
                    >
                      <MaterialIcons
                        name="check"
                        size={24}
                        color={
                          localPriceError
                            ? colors.textSecondary
                            : colors.primary
                        }
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleCancel}
                    >
                      <MaterialIcons name="close" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        handleDeleteProduct(product.idcatalogoProduto)
                      }
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={24}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleEditMode(product.idcatalogoProduto)}
                    >
                      <MaterialIcons
                        name="edit"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  const NavButton: React.FC<{
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    isActive?: boolean;
    onPress: () => void;
  }> = ({ icon, label, isActive = false, onPress }) => (
    <TouchableOpacity
      style={[styles.navButton, isActive && styles.navButtonActive]}
      onPress={onPress}
    >
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

  const hasActiveFilters = categoryValue || laboratoryValue || searchText;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header
        title="Gerenciar Produtos"
        showBackButton
        customRightComponent={<AddProductComponent />}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filtersSection}>
          <View style={styles.filtersHeader}>
            <Text style={[styles.filtersTitle, { color: colors.text }]}>
              Filtros
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={clearFilters}
                style={styles.clearButton}
              >
                <Text
                  style={[styles.clearButtonText, { color: colors.primary }]}
                >
                  Limpar filtros
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filtersRow}>
            <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Categoria
              </Text>
              <DropDownPicker
                open={openCategory}
                value={categoryValue}
                items={categoryItems}
                setOpen={setOpenCategory}
                setValue={handleCategoryValueChange as any}
                placeholder="Todas categorias"
                searchable={true}
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colors.grayLight,
                    borderColor: colors.border,
                  },
                ]}
                textStyle={[
                  styles.dropdownText,
                  { color: categoryValue ? colors.text : colors.textSecondary },
                ]}
                dropDownContainerStyle={[
                  styles.dropdownList,
                  { backgroundColor: colors.white, borderColor: colors.border },
                ]}
                listItemLabelStyle={styles.listItemLabel}
                placeholderStyle={styles.placeholderText}
                closeOnBackPressed={true}
                listMode="MODAL"
                modalTitle="Selecionar categoria"
              />
            </View>

            <View style={[styles.dropdownContainer, { zIndex: 2000 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Laboratorio
              </Text>
              <DropDownPicker
                open={openLaboratory}
                value={laboratoryValue}
                items={laboratoryItems}
                setOpen={setOpenLaboratory}
                setValue={handleLaboratoryValueChange as any}
                placeholder="Todos laboratórios"
                searchable={true}
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
                    color: laboratoryValue ? colors.text : colors.textSecondary,
                  },
                ]}
                dropDownContainerStyle={[
                  styles.dropdownList,
                  { backgroundColor: colors.white, borderColor: colors.border },
                ]}
                listItemLabelStyle={styles.listItemLabel}
                placeholderStyle={styles.placeholderText}
                closeOnBackPressed={true}
                listMode="MODAL"
                modalTitle="Selecionar laboratório"
              />
            </View>
          </View>

          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.grayLight,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="nome / registro MS / codigo produto / substância / categoria"
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <View style={styles.resultsInfo}>
            <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
              {filteredProducts.length} produto(s) encontrado(s)
              {hasActiveFilters && " com os filtros aplicados"}
            </Text>
          </View>
        </View>

        <View style={styles.productsList}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text
                style={[styles.emptyStateText, { color: colors.textSecondary }]}
              >
                Carregando produtos...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="error-outline" size={48} color="#FF3B30" />
              <Text style={[styles.emptyStateText, { color: "#FF3B30" }]}>
                Erro ao carregar: {error}
              </Text>
            </View>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.idcatalogoProduto}
                product={product}
                toggleProductExpansion={toggleProductExpansion}
                toggleEditMode={toggleEditMode}
                toggleAvailability={toggleAvailability}
                saveProductChanges={saveProductChanges}
                handleDeleteProduct={handleDeleteProduct}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="search-off"
                size={48}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.emptyStateText, { color: colors.textSecondary }]}
              >
                Nenhum produto encontrado
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  { color: colors.textSecondary },
                ]}
              >
                Tente ajustar os filtros ou termos de busca
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  addButton: { padding: 4 },
  content: { flex: 1 },
  filtersSection: { padding: 16, gap: 16 },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filtersTitle: { fontSize: 16, fontWeight: "600" },
  clearButton: { padding: 8 },
  clearButtonText: { fontSize: 14, fontWeight: "500" },
  filtersRow: { flexDirection: "row", gap: 16 },
  dropdownContainer: { flex: 1, gap: 4 },
  label: { fontSize: 14, fontWeight: "500" },
  dropdown: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  dropdownText: { fontSize: 16 },
  dropdownList: { borderWidth: 1, borderRadius: 12, marginTop: 4 },
  listItemLabel: { fontSize: 16, color: "#000000" },
  placeholderText: { color: "#6B7280", fontSize: 16 },
  arrowIcon: { width: 20, height: 20 },
  tickIcon: { width: 20, height: 20 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  searchIcon: { position: "absolute", left: 12, zIndex: 1 },
  searchInput: {
    flex: 1,
    paddingLeft: 44,
    paddingRight: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  resultsInfo: { alignItems: "center" },
  resultsText: { fontSize: 14, fontStyle: "italic" },
  productsList: { padding: 16, gap: 16, paddingBottom: 20, minHeight: 200 },
  productCard: { borderRadius: 12, padding: 16, gap: 16 },
  productHeader: { flexDirection: "row", gap: 16 },
  productImageContainer: {
    width: 80,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
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
  productInfo: { flex: 1 },
  productTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flex: 1,
  },
  productDetails: { flex: 1, flexShrink: 1, marginRight: 8 },
  productName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  productLab: { fontSize: 14 },
  productCategory: { fontSize: 14, fontStyle: "italic" },
  productReg: { fontSize: 14 },
  productPrice: { fontSize: 16, fontWeight: "600" },
  priceBlockContainer: {
    minWidth: 100,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  divider: { borderTopWidth: 1 },
  productDetailsSection: { gap: 8 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  detailLabel: { fontSize: 14, marginRight: 8 },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    flexShrink: 1,
    textAlign: "right",
  },
  productActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bulaButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  bulaText: { fontSize: 14, fontWeight: "500" },
  availabilityContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  availabilityText: { fontSize: 14 },
  actionButtons: { flexDirection: "row", alignItems: "center", gap: 16 },
  actionButton: { padding: 4 },
  actionButtonDisabled: { opacity: 0.5 },
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
    borderRadius: 8,
  },
  navButtonActive: {},
  navLabel: { fontSize: 12, marginTop: 4 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyStateText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  emptyStateSubtext: { fontSize: 14, textAlign: "center" },
  addProductButton: { padding: 4 },
});

export default ManageProductsScreen;
