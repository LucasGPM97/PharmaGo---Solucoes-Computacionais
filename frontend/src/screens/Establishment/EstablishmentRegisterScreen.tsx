import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { EstablishmentAuthStackParamList } from "../../navigation/EstablishmentNavigator";
import MaskedInput from "../../components/common/MaskedInput";
import Button from "../../components/common/Button";
import { registerEstablishment } from "../../services/common/AuthService";
import { MaterialIcons } from "@expo/vector-icons";

type EstablishmentRegisterScreenNavigationProp = StackNavigationProp<
  EstablishmentAuthStackParamList,
  "EstablishmentRegister"
>;

interface EstablishmentRegisterScreenProps {
  navigation: EstablishmentRegisterScreenNavigationProp;
}

const EstablishmentRegisterScreen: React.FC<
  EstablishmentRegisterScreenProps
> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [name2, setName2] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [registroAnvisa, setRegistroAnvisa] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          newErrors.name = "Razão Social é obrigatória";
        } else if (value.trim().length < 2) {
          newErrors.name = "Razão Social deve ter pelo menos 2 caracteres";
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value || value.trim().length === 0) {
          newErrors.email = "E-mail é obrigatório";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            newErrors.email = "Digite um e-mail válido (ex: loja@email.com)";
          } else {
            delete newErrors.email;
          }
        }
        break;

      case 'name2':
        if (!value || value.trim().length === 0) {
          newErrors.name2 = "Responsável Técnico é obrigatório";
        } else if (value.trim().length < 2) {
          newErrors.name2 = "Responsável Técnico deve ter pelo menos 2 caracteres";
        } else {
          delete newErrors.name2;
        }
        break;

      case 'contactNumber':
        if (!value || value.trim().length === 0) {
          newErrors.contactNumber = "Telefone é obrigatório";
        } else {
          const phoneDigits = value.replace(/\D/g, "");
          if (phoneDigits.length < 10) {
            newErrors.contactNumber = "Telefone deve ter pelo menos 10 dígitos";
          } else {
            delete newErrors.contactNumber;
          }
        }
        break;

      case 'cnpj':
        if (!value || value.trim().length === 0) {
          newErrors.cnpj = "CNPJ é obrigatório";
        } else {
          const cnpjDigits = value.replace(/\D/g, "");
          if (cnpjDigits.length !== 14) {
            newErrors.cnpj = "CNPJ deve ter 14 dígitos";
          } else {
            delete newErrors.cnpj;
          }
        }
        break;

      case 'registroAnvisa':
        if (!value || value.trim().length === 0) {
          newErrors.registroAnvisa = "Registro ANVISA é obrigatório";
        } else if (value.trim().length < 3) {
          newErrors.registroAnvisa = "Registro ANVISA deve ter pelo menos 3 caracteres";
        } else {
          delete newErrors.registroAnvisa;
        }
        break;

      case 'password':
        if (!value || value.trim().length === 0) {
          newErrors.password = "Senha é obrigatória";
        } else if (value.length < 6) {
          newErrors.password = "Senha deve ter pelo menos 6 caracteres";
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value || value.trim().length === 0) {
          newErrors.confirmPassword = "Confirme sua senha";
        } else if (value !== password) {
          newErrors.confirmPassword = "As senhas não coincidem";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Valida todos os campos
    validateField("name", name);
    validateField("email", email);
    validateField("name2", name2);
    validateField("contactNumber", contactNumber);
    validateField("cnpj", cnpj);
    validateField("registroAnvisa", registroAnvisa);
    validateField("password", password);
    validateField("confirmPassword", confirmPassword);

    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert("Atenção", "Por favor, corrija os erros antes de cadastrar");
      return;
    }

    setLoading(true);
    try {
      const contaBancaria = 0;
      const raioCobertura = 0;
      const valorMinimoEntrega = 0;
      const taxaEntrega = 0;
      
      await registerEstablishment({
        razao_social: name,
        cnpj: cnpj,
        email: email,
        senha: password,
        telefone_contato: contactNumber,
        responsavel_tecnico: name2,
        registro_anvisa: registroAnvisa,
        conta_bancaria: contaBancaria,
        raio_cobertura: raioCobertura,
        valor_minimo_entrega: valorMinimoEntrega,
        taxa_entrega: taxaEntrega,
      });
      
      Alert.alert(
        "Sucesso",
        "Cadastro realizado com sucesso! Faça login para continuar."
      );
      navigation.navigate("EstablishmentLogin");
    } catch (error) {
      console.error("Erro no registro:", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao tentar registrar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Cadastro do Estabelecimento</Text>
            <Text style={styles.subtitle}>Crie a conta da sua loja</Text>

            <MaskedInput
              label="Razão Social"
              placeholder="Farmácia Central"
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError("name");
                validateField("name", text);
              }}
              error={errors.name}
              iconName="business-outline"
            />

            <MaskedInput
              label="Email"
              placeholder="loja@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError("email");
                validateField("email", text);
              }}
              error={errors.email}
              keyboardType="email-address"
              iconName="mail-outline"
            />

            <MaskedInput
              label="Responsável Técnico"
              placeholder="Fulano de Tal"
              value={name2}
              onChangeText={(text) => {
                setName2(text);
                clearError("name2");
                validateField("name2", text);
              }}
              error={errors.name2}
              iconName="person-outline"
            />

            <MaskedInput
              label="Número de Contato"
              placeholder="(xx) xxxxx-xxxx"
              value={contactNumber}
              onChangeText={(text) => {
                setContactNumber(text);
                clearError("contactNumber");
                validateField("contactNumber", text);
              }}
              error={errors.contactNumber}
              iconName="call-outline"
              maskType="phone"
            />

            <MaskedInput
              label="CNPJ"
              placeholder="XX.XXX.XXX/XXXX-XX"
              value={cnpj}
              onChangeText={(text) => {
                setCnpj(text);
                clearError("cnpj");
                validateField("cnpj", text);
              }}
              error={errors.cnpj}
              iconName="document-text-outline"
              maskType="cnpj"
            />

            <MaskedInput
              label="Registro ANVISA"
              placeholder="Ex: 123456789"
              value={registroAnvisa}
              onChangeText={(text) => {
                setRegistroAnvisa(text);
                clearError("registroAnvisa");
                validateField("registroAnvisa", text);
              }}
              error={errors.registroAnvisa}
              iconName="medkit-outline"
              maskType="anvisa"
            />

            <MaskedInput
              label="Senha"
              placeholder="Crie sua senha"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError("password");
                validateField("password", text);
                
                // Valida a confirmação quando a senha muda
                if (confirmPassword) {
                  validateField("confirmPassword", confirmPassword);
                }
              }}
              error={errors.password}
              secureTextEntry
              iconName="lock-closed-outline"
            />

            <MaskedInput
              label="Confirme sua senha"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError("confirmPassword");
                validateField("confirmPassword", text);
              }}
              error={errors.confirmPassword}
              secureTextEntry
              iconName="lock-closed-outline"
            />

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Eu li e concordo com os{" "}
                <Text style={styles.termsLink}>Termos e Condições de Uso</Text>{" "}
                e a{" "}
                <Text style={styles.termsLink}>Política de Privacidade</Text>.
              </Text>
            </View>

            <Button
              title="Cadastrar Estabelecimento"
              onPress={handleRegister}
              loading={loading}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("EstablishmentLogin")}
            >
              <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  formContainer: {
    width: "85%",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: "#666",
    flexShrink: 1,
  },
  termsLink: {
    color: "#007bff",
    fontWeight: "bold",
  },
  loginText: {
    textAlign: "center",
    color: "#007bff",
    marginTop: 20,
    fontSize: 16,
  },
  errorsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    marginBottom: 16,
    gap: 8,
  },
  errorsSummaryText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default EstablishmentRegisterScreen;