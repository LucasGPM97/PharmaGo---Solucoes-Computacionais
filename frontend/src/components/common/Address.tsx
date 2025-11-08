import React, { useState } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";
import { mask as maskCep } from "react-native-mask-text";

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}

export interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  initialAddress?: AddressData;
}

const AddressModal: React.FC<AddressModalProps> = ({
  visible,
  onClose,
  onSave,
  initialAddress,
}) => {
  const [address, setAddress] = useState<AddressData>(
    initialAddress || {
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      complement: "",
    }
  );

  const [errors, setErrors] = useState<Partial<AddressData>>({});
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // --- Função de Busca de CEP (ViaCEP) ---
  const fetchAddressByCep = async (rawCep: string) => {
    // Remove qualquer formatação (hífen)
    const cep = rawCep.replace(/\D/g, "");

    // Só busca se tiver 8 dígitos
    if (cep.length !== 8) return;

    setIsLoadingCep(true);
    setErrors((prev) => ({ ...prev, cep: undefined })); // Limpa erro ao buscar

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErrors((prev) => ({ ...prev, cep: "CEP não encontrado." }));
        // Se der erro, limpa os campos preenchíveis automaticamente
        setAddress((prev) => ({
          ...prev,
          street: "",
          neighborhood: "",
          city: "",
          state: "",
        }));
      } else {
        // Preenche os campos com os dados da API
        setAddress((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          // Mantém 'number' e 'complement' se já estavam preenchidos
        }));
        setErrors((prev) => ({ ...prev, cep: undefined })); // Sucesso, remove erro
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
  // ----------------------------------------

  const handleSave = () => {
    const newErrors: Partial<AddressData> = {};

    // Validações básicas
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
    onSave(address);
    onClose();
  };

  const updateField = (field: keyof AddressData, value: string) => {
    let newValue = value;

    // Aplica máscara ao campo 'cep'
    if (field === "cep") {
      // Use o mask para formatar o valor
      newValue = maskCep(value, "99999-999");
    }

    setAddress((prev) => ({ ...prev, [field]: newValue }));

    // Limpa erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Se for o campo CEP e o tamanho for 9 (com a máscara, ex: '12345-678')
    // dispara a busca.
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
        <Text style={styles.title}>Adicionar Novo Endereço</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={20} color="#64748b" />
        </TouchableOpacity>
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
    editable: boolean = true // Novo parâmetro para controlar se é editável
  ) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {optional && <Text style={styles.optionalText}>Opcional</Text>}
      </View>
      <View style={styles.inputWrapper}>
        {" "}
        {/* Novo View para envolver input e loading */}
        <TextInput
          style={[
            styles.input,
            errors[field] && styles.inputError,
            !editable && styles.inputDisabled, // Novo estilo para campo desabilitado
          ]}
          value={address[field]}
          onChangeText={(text) => updateField(field, text)}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          keyboardType={keyboardType}
          maxLength={field === "cep" ? 9 : undefined} // Limite para o CEP
          editable={editable && !isLoadingCep} // Desabilita se não for editável OU estiver buscando CEP
        />
        {field === "cep" && isLoadingCep && (
          <ActivityIndicator color="#0d59f2" style={styles.loadingIndicator} />
        )}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderFooter = () => (
    /* ... código do footer inalterado ... */
    <View style={styles.footer}>
      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.saveButton, isLoadingCep && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoadingCep} // Desabilita o botão enquanto busca CEP
      >
        <Text style={styles.saveButtonText}>Salvar Endereço</Text>
      </TouchableOpacity>
    </View>
  );

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
            {/* CEP - Adicionado keyboardType e fetch na atualização */}
            {renderInput("CEP", "cep", "00000-000", false, "numeric")}

            {/* Rua - Não editável se estiver buscando (editable={!isLoadingCep} dentro do renderInput) */}
            {renderInput(
              "Rua",
              "street",
              "Digite o nome da rua",
              false,
              "default",
              !isLoadingCep
            )}

            {/* Número e Bairro */}
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                {/* Número: Teclado numérico, pois é um número */}
                {renderInput("Número", "number", "Ex: 123", false, "numeric")}
              </View>
              <View style={styles.halfInput}>
                {/* Bairro - Não editável se estiver buscando */}
                {renderInput(
                  "Bairro",
                  "neighborhood",
                  "Digite o bairro",
                  false,
                  "default",
                  !isLoadingCep
                )}
              </View>
            </View>

            {/* Cidade e Estado */}
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                {/* Cidade - Não editável se estiver buscando */}
                {renderInput(
                  "Cidade",
                  "city",
                  "Ex: São Paulo",
                  false,
                  "default",
                  !isLoadingCep
                )}
              </View>
              <View style={styles.halfInput}>
                {/* Estado - Não editável se estiver buscando */}
                {renderInput(
                  "Estado",
                  "state",
                  "Ex: SP",
                  false,
                  "default",
                  !isLoadingCep
                )}
              </View>
            </View>

            {/* Complemento */}
            {renderInput(
              "Complemento",
              "complement",
              "Apto, bloco, referência",
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f6f8",
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
  // Novo estilo para o wrapper do input (para o loading)
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
    color: "#94a3b8",
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
  // Novo estilo para botão Salvar desabilitado
  saveButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
});

export default AddressModal;
