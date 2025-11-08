import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { mask as maskCep } from "react-native-mask-text";
import {
  createEnderecoEstabelecimento,
  updateEnderecoEstabelecimento,
} from "../../services/establishment/EstablishmentAddressService";

import MaskedInput from "../common/MaskedInput";

// CORREÇÃO: Atualizar a interface para incluir o ID
export interface AddressData {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  idendereco_estabelecimento?: number; // ADICIONAR ESTA PROPRIEDADE
}

export interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  initialAddress?: AddressData;
}

const AddressModalEstablishment: React.FC<AddressModalProps> = ({
  visible,
  onClose,
  onSave,
  initialAddress,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(!initialAddress);

  const [address, setAddress] = useState<AddressData>(
    initialAddress || {
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      complement: "",
      idendereco_estabelecimento: undefined,
    }
  );

  const [errors, setErrors] = useState<Partial<AddressData>>({});
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado separado para submit

  // Sincronizar o estado interno quando initialAddress mudar
  useEffect(() => {
    if (initialAddress) {
      console.log("🔄 Sincronizando modal com initialAddress:", initialAddress);
      setAddress(initialAddress);
      setIsEditing(false);
    } else {
      console.log("🔄 Sem initialAddress, resetando formulário");
      setAddress({
        cep: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        complement: "",
        idendereco_estabelecimento: undefined,
      });
      setIsEditing(true);
    }
    setErrors({});
  }, [initialAddress, visible]);

  // Função de Busca de CEP
  const fetchAddressByCep = async (rawCep: string) => {
    const cep = rawCep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setIsLoadingCep(true);
    setErrors((prev) => ({ ...prev, cep: undefined }));

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrors((prev) => ({ ...prev, cep: "CEP não encontrado." }));
        setAddress((prev) => ({
          ...prev,
          street: "",
          neighborhood: "",
          city: "",
          state: "",
        }));
      } else {
        setAddress((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }));
        setErrors((prev) => ({ ...prev, cep: undefined }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setErrors((prev) => ({
        ...prev,
        cep: "Erro ao conectar com o serviço de CEP.",
      }));
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleSave = async () => {
    const newErrors: Partial<AddressData> = {};

    if (!address.cep) newErrors.cep = "CEP é obrigatório";
    if (!address.street) newErrors.street = "Rua é obrigatória";
    if (!address.number) newErrors.number = "Número é obrigatório";
    if (!address.neighborhood) newErrors.neighborhood = "Bairro é obrigatório";
    if (!address.city) newErrors.city = "Cidade é obrigatória";
    if (!address.state) newErrors.state = "Estado é obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let savedAddress: AddressData;

      if (address.idendereco_estabelecimento) {
        // ATUALIZAÇÃO
        const updated = await updateEnderecoEstabelecimento(
          address.idendereco_estabelecimento,
          address
        );
        savedAddress = { ...address, ...updated };
      } else {
        // CRIAÇÃO
        const created = await createEnderecoEstabelecimento(address);
        savedAddress = { ...address, ...created };
      }

      onSave(savedAddress);
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erro ao salvar o endereço.";
      console.error("Erro de API ao salvar endereço:", errorMessage);
      setErrors((prev) => ({ ...prev, city: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof AddressData, value: string) => {
    let newValue = value;

    if (field === "cep") {
      newValue = maskCep(value, "99999-999");
    }

    setAddress((prev) => ({ ...prev, [field]: newValue.toString() }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === "cep" && newValue.length === 9) {
      fetchAddressByCep(newValue);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
      <View style={styles.headerContent}>
        <Text style={styles.title}>
          {initialAddress && !isEditing
            ? "Detalhes do Endereço"
            : "Adicionar Novo Endereço"}
        </Text>
        <View style={styles.headerActions}>
          {initialAddress && !isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Feather name="edit-2" size={20} color="#0d59f2" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderInput = (
    label: string,
    field: keyof AddressData,
    placeholder: string,
    optional?: boolean,
    keyboardType:
      | "default"
      | "numeric"
      | "email-address"
      | "phone-pad" = "default",
    allowEditing: boolean = true
  ) => {
    const isFieldEditable = isEditing && allowEditing && !isLoadingCep;

    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {optional && <Text style={styles.optionalText}>Opcional</Text>}
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              errors[field] && styles.inputError,
              !isFieldEditable && styles.inputDisabled,
            ]}
            value={address[field]}
            onChangeText={(text) => updateField(field, text)}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            keyboardType={keyboardType}
            maxLength={field === "cep" ? 9 : undefined}
            editable={isFieldEditable}
          />
          {field === "cep" && isLoadingCep && (
            <ActivityIndicator
              color="#0d59f2"
              style={styles.loadingIndicator}
            />
          )}
        </View>
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  const renderFooter = () => {
    // Calcular o flex do botão cancelar baseado no estado atual
    const cancelButtonFlex = initialAddress && !isEditing ? 1 : 0.4;

    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cancelButton, { flex: cancelButtonFlex }]}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>
            {initialAddress && !isEditing ? "Fechar" : "Cancelar"}
          </Text>
        </TouchableOpacity>
        {isEditing && (
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSubmitting || isLoadingCep) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSubmitting || isLoadingCep}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Endereço</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity
          style={styles.backgroundDimmer}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.bottomSheet}>
          {renderHeader()}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderInput("CEP", "cep", "00000-000", false, "numeric", true)}
            {renderInput(
              "Rua",
              "street",
              "Digite o nome da rua",
              false,
              "default",
              true
            )}

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                {renderInput(
                  "Número",
                  "number",
                  "Ex: 123",
                  false,
                  "numeric",
                  true
                )}
              </View>
              <View style={styles.halfInput}>
                {renderInput(
                  "Bairro",
                  "neighborhood",
                  "Digite o bairro",
                  false,
                  "default",
                  true
                )}
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                {renderInput(
                  "Cidade",
                  "city",
                  "Ex: São Paulo",
                  false,
                  "default",
                  true
                )}
              </View>
              <View style={styles.halfInput}>
                {renderInput(
                  "Estado",
                  "state",
                  "Ex: SP",
                  false,
                  "default",
                  true
                )}
              </View>
            </View>

            {renderInput(
              "Complemento",
              "complement",
              "Apto, bloco, referência",
              true,
              "default",
              true
            )}
          </ScrollView>

          {renderFooter()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... estilos existentes ...
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backgroundDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "90%",
    flex: 1,
  },
  handleContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#dbdfe6",
  },
  header: {
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111318",
  },
  headerActions: {
    // Novo estilo para agrupar botões de fechar e editar
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f6f8",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    // Novo estilo para o botão de edição
    width: 32,
    height: 32,
    borderRadius: 16,
    // Estilo sutilmente diferente ou apenas um toque para indicar ação
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111318",
  },
  optionalText: {
    fontSize: 12,
    color: "#64748b",
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111318",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  inputDisabled: {
    backgroundColor: "#f5f6f8",
    color: "#111318", // Cor do texto mais escura para melhor legibilidade no modo de visualização
  },
  loadingIndicator: {
    position: "absolute",
    right: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0d59f2",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  saveButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
});

export default AddressModalEstablishment;
