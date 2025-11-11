import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

// Serviço atualizado
import {
  getClienteById,
  updateCliente,
} from "../../services/client/ClientService";

// Componentes personalizados
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import MaskedInput from "../../components/common/MaskedInput";
import DateInput from "../../components/common/DateInput";

// Tipos
type Cliente = {
  idcliente: number;
  email: string;
  nome: string;
  senha?: string;
  documento_identificacao: string;
  data_nascimento: string;
  numero_contato: string;
  imagem_perfil_url?: string;
  created_at?: string;
  updated_at?: string;
};

type UpdateClienteData = {
  nome?: string;
  email?: string;
  numero_contato?: string;
  data_nascimento?: string;
  imagem_perfil_url?: string;
};

type AccountManagementProps = {
  navigation: any;
};

const AccountManagement: React.FC<AccountManagementProps> = ({
  navigation,
}) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados para os campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [numeroContato, setNumeroContato] = useState("");
  const [documentoIdentificacao, setDocumentoIdentificacao] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [imagemPerfilUrl, setImagemPerfilUrl] = useState("");

  // Carregar dados do cliente - COM DEBUG
  const loadClienteData = async () => {
    try {
      setIsLoading(true);

      console.log("🔄 Iniciando carregamento dos dados...");
      const clienteData = await getClienteById();
      console.log("📦 Dados recebidos do servidor:", clienteData);

      setCliente(clienteData);

      // Preencher os campos do formulário com verificação
      setNome(clienteData.nome || "");
      setEmail(clienteData.email || "");
      setNumeroContato(clienteData.numero_contato || "");
      setDocumentoIdentificacao(clienteData.documento_identificacao || "");
      setDataNascimento(clienteData.data_nascimento || "");
      setImagemPerfilUrl(clienteData.imagem_perfil_url || "");

      console.log("✅ Campos preenchidos:");
      console.log("Nome:", clienteData.nome);
      console.log("Email:", clienteData.email);
      console.log("Telefone:", clienteData.numero_contato);
      console.log("CPF:", clienteData.documento_identificacao);
      console.log("Data Nasc:", clienteData.data_nascimento);
    } catch (error: any) {
      console.error("❌ Erro ao carregar dados do cliente:", error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível carregar seus dados"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Validações corrigidas e simplificadas
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    console.log("🔍 Validando formulário...");
    console.log("Nome para validação:", nome, "Comprimento:", nome.length);
    console.log("Email para validação:", email, "Comprimento:", email.length);

    // Validação do NOME - mais simples
    if (!nome || nome.trim().length === 0) {
      newErrors.nome = "Nome é obrigatório";
    } else if (nome.trim().length < 2) {
      newErrors.nome = "Nome deve ter pelo menos 2 caracteres";
    }

    // Validação do EMAIL - mais simples
    if (!email || email.trim().length === 0) {
      newErrors.email = "E-mail é obrigatório";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Digite um e-mail válido (ex: usuario@email.com)";
      }
    }

    // Validação do TELEFONE
    if (!numeroContato || numeroContato.trim().length === 0) {
      newErrors.numeroContato = "Telefone é obrigatório";
    } else {
      const phoneDigits = numeroContato.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        newErrors.numeroContato = "Telefone deve ter pelo menos 10 dígitos";
      }
    }

    // Validação da DATA DE NASCIMENTO
    if (!dataNascimento || dataNascimento.trim().length === 0) {
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
    }

    console.log("❌ Erros encontrados:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Verificar se houve mudanças
  const hasChanges = (): boolean => {
    if (!cliente) return false;

    const changed =
      nome !== cliente.nome ||
      email !== cliente.email ||
      numeroContato !== cliente.numero_contato ||
      dataNascimento !== cliente.data_nascimento ||
      imagemPerfilUrl !== (cliente.imagem_perfil_url || "");

    console.log("🔄 Verificando mudanças:", changed);
    return changed;
  };

  // Salvar alterações
  const saveChanges = async () => {
    console.log("💾 Iniciando salvamento...");

    if (!validateForm()) {
      Alert.alert("Atenção", "Por favor, corrija os erros antes de salvar");
      return;
    }

    if (!hasChanges()) {
      Alert.alert("Aviso", "Nenhuma alteração foi feita");
      return;
    }

    try {
      setIsSaving(true);

      const updateData: UpdateClienteData = {};

      // Só inclui os campos que foram alterados
      if (nome !== cliente?.nome) updateData.nome = nome;
      if (email !== cliente?.email) updateData.email = email;
      if (numeroContato !== cliente?.numero_contato)
        updateData.numero_contato = numeroContato;
      if (dataNascimento !== cliente?.data_nascimento) {
        updateData.data_nascimento = dataNascimento;
      }
      if (imagemPerfilUrl !== (cliente?.imagem_perfil_url || "")) {
        updateData.imagem_perfil_url = imagemPerfilUrl;
      }

      console.log("📤 Dados para atualização:", updateData);

      if (Object.keys(updateData).length === 0) {
        Alert.alert("Aviso", "Nenhuma alteração foi feita");
        return;
      }

      const updatedCliente = await updateCliente(updateData);

      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      setCliente(updatedCliente);
    } catch (error: any) {
      console.error("❌ Erro ao atualizar dados:", error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível atualizar seus dados"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Resetar formulário
  const resetForm = () => {
    if (cliente) {
      setNome(cliente.nome || "");
      setEmail(cliente.email || "");
      setNumeroContato(cliente.numero_contato || "");
      setDataNascimento(cliente.data_nascimento || "");
      setImagemPerfilUrl(cliente.imagem_perfil_url || "");
      setErrors({});
      console.log("🔄 Formulário resetado para valores originais");
    }
  };

  useEffect(() => {
    loadClienteData();
  }, []);

  // Voltar com confirmação se houver mudanças
  const goBack = () => {
    if (hasChanges()) {
      Alert.alert(
        "Alterações não salvas",
        "Você tem alterações não salvas. Deseja realmente sair?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleDateChange = (date: string) => {
    setDataNascimento(date);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Header showBackButton onBackPress={goBack} title="Meus Dados" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando seus dados...</Text>
        </View>
        <Footer />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Header showBackButton title="Meus Dados" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            {/* Nome */}
            <View>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <TextInput
                style={[styles.textInput, errors.nome && styles.inputError]}
                value={nome}
                onChangeText={setNome}
                placeholder="Digite seu nome completo"
                placeholderTextColor="#999"
              />
              {errors.nome && (
                <Text style={styles.errorText}>{errors.nome}</Text>
              )}
            </View>

            {/* Email */}
            <View>
              <Text style={styles.inputLabel}>E-mail *</Text>
              <TextInput
                style={[styles.textInput, errors.email && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Telefone */}
            <MaskedInput
              label="Telefone *"
              value={numeroContato}
              onChangeText={setNumeroContato}
              placeholder="(00) 00000-0000"
              error={errors.numeroContato}
              iconName="call-outline"
              maskType="phone"
              keyboardType="phone-pad"
            />

            {/* CPF */}
            <MaskedInput
              label="CPF"
              value={documentoIdentificacao}
              onChangeText={setDocumentoIdentificacao}
              placeholder="000.000.000-00"
              error={errors.documentoIdentificacao}
              iconName="card-outline"
              maskType="cpf"
              keyboardType="numeric"
              editable={false}
            />

            {/* Data de Nascimento */}
            <DateInput
              label="Data de Nascimento"
              value={dataNascimento}
              onChange={handleDateChange}
              error={errors.dataNascimento}
              editable={false}
            />
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!hasChanges() || isSaving) && styles.saveButtonDisabled,
              ]}
              onPress={saveChanges}
              disabled={!hasChanges() || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cancelButton,
                !hasChanges() && styles.cancelButtonDisabled,
              ]}
              onPress={resetForm}
              disabled={!hasChanges()}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  !hasChanges() && styles.cancelButtonTextDisabled,
                ]}
              >
                Descartar Alterações
              </Text>
            </TouchableOpacity>
          </View>

          {/* Espaço para o footer não sobrepor o conteúdo */}
          <View style={styles.footerSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Footer />
    </SafeAreaView>
  );
};

// Adicionando estilos para TextInput básico
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
    paddingBottom: 80,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginHorizontal: 8,
    marginTop: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  changePhotoText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  formSection: {
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  actionsSection: {
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonDisabled: {
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  cancelButtonTextDisabled: {
    color: "#9CA3AF",
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
  footerSpacer: {
    height: 20,
  },
  debugButton: {
    padding: 12,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  debugButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default AccountManagement;
