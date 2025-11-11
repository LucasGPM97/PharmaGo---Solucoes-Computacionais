import React, { use, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import MaskedInput from "../../components/common/MaskedInput";
import Button from "../../components/common/Button";
import { registerClient } from "../../services/common/AuthService";
import DateInput from "../../components/common/DateInput";
import { MaterialIcons } from "@expo/vector-icons";

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Register"
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [date, setDate] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value || value.trim().length === 0) {
          newErrors.name = "Nome é obrigatório";
        } else if (value.trim().length < 2) {
          newErrors.name = "Nome deve ter pelo menos 2 caracteres";
        } else {
          delete newErrors.name;
        }
        break;

      case "email":
        if (!value || value.trim().length === 0) {
          newErrors.email = "E-mail é obrigatório";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            newErrors.email = "Digite um e-mail válido (ex: usuario@email.com)";
          } else {
            delete newErrors.email;
          }
        }
        break;

      case "contactNumber":
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

      case "date":
        if (!value || value.trim().length === 0) {
          newErrors.date = "Data de nascimento é obrigatória";
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const minAgeDate = new Date();
          minAgeDate.setFullYear(today.getFullYear() - 16);

          if (isNaN(birthDate.getTime())) {
            newErrors.date = "Data de nascimento inválida";
          } else if (birthDate > minAgeDate) {
            newErrors.date =
              "Você deve ter pelo menos 16 anos para se cadastrar";
          } else if (birthDate > today) {
            newErrors.date = "Data de nascimento não pode ser futura";
          } else {
            delete newErrors.date;
          }
        }
        break;

      case "document":
        if (!value || value.trim().length === 0) {
          newErrors.document = "Documento de identificação é obrigatório";
        } else {
          const docDigits = value.replace(/\D/g, "");
          if (docDigits.length < 11) {
            newErrors.document = "CPF deve ter 11 dígitos";
          } else {
            delete newErrors.document;
          }
        }
        break;

      case "password":
        if (!value || value.trim().length === 0) {
          newErrors.password = "Senha é obrigatória";
        } else if (value.length < 6) {
          newErrors.password = "Senha deve ter pelo menos 6 caracteres";
        } else {
          delete newErrors.password;
        }
        break;

      case "confirmPassword":
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

    if (!name || name.trim().length === 0) {
      newErrors.name = "Nome é obrigatório";
    } else if (name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!email || email.trim().length === 0) {
      newErrors.email = "E-mail é obrigatório";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = "Digite um e-mail válido (ex: usuario@email.com)";
      }
    }

    if (!contactNumber || contactNumber.trim().length === 0) {
      newErrors.contactNumber = "Telefone é obrigatório";
    } else {
      const phoneDigits = contactNumber.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        newErrors.contactNumber = "Telefone deve ter pelo menos 10 dígitos";
      }
    }

    if (!date || date.trim().length === 0) {
      newErrors.date = "Data de nascimento é obrigatória";
    } else {
      const birthDate = new Date(date);
      const today = new Date();
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - 16);

      if (isNaN(birthDate.getTime())) {
        newErrors.date = "Data de nascimento inválida";
      } else if (birthDate > minAgeDate) {
        newErrors.date = "Você deve ter pelo menos 16 anos para se cadastrar";
      } else if (birthDate > today) {
        newErrors.date = "Data de nascimento não pode ser futura";
      }
    }

    if (!document || document.trim().length === 0) {
      newErrors.document = "Documento de identificação é obrigatório";
    } else {
      const docDigits = document.replace(/\D/g, "");
      if (docDigits.length < 11) {
        newErrors.document = "CPF deve ter 11 dígitos";
      }
    }

    if (!password || password.trim().length === 0) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!confirmPassword || confirmPassword.trim().length === 0) {
      newErrors.confirmPassword = "Confirme sua senha";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert("Atenção", "Por favor, corrija os erros antes de cadastrar");
      return;
    }

    setLoading(true);
    try {
      await registerClient({
        email: email,
        nome: name,
        senha: password,
        documento_identificacao: document,
        data_nascimento: date,
        numero_contato: contactNumber,
      });
      Alert.alert(
        "Sucesso",
        "Cadastro realizado com sucesso! Faça login para continuar."
      );
      navigation.navigate("Login");
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
            <Text style={styles.title}>Cadastro</Text>
            <Text style={styles.subtitle}>Crie sua conta para começar</Text>
            <MaskedInput
              label="Nome"
              placeholder="Lucas"
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError("name");
                validateField("name", text);
              }}
              error={errors.name}
              iconName="person-outline"
            />

            <MaskedInput
              label="Email"
              placeholder="name@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError("email");
                validateField("email", text);
              }}
              error={errors.email}
              iconName="mail-outline"
              keyboardType="email-address"
            />

            <MaskedInput
              label="Documento de Identificação"
              placeholder="RG / CPF"
              value={document}
              onChangeText={(text) => {
                setDocument(text);
                clearError("document");
                validateField("document", text);
              }}
              error={errors.document}
              iconName="document-outline"
              maskType="cpf"
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

            <DateInput
              label="Data de Nascimento"
              value={date}
              onChange={(text) => {
                setDate(text);
                clearError("date");
                validateField("date", text);
              }}
              error={errors.date}
            />

            <MaskedInput
              label="Senha"
              placeholder="Crie sua senha"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearError("password");
                validateField("password", text);
                if (confirmPassword) {
                  validateField("confirmPassword", confirmPassword);
                }
              }}
              error={errors.password}
              secureTextEntry={true}
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
              secureTextEntry={true}
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
              title="Cadastrar-se"
              onPress={handleRegister}
              loading={loading}
            />
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
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
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    marginBottom: 16,
  },
  errorsSummaryText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default RegisterScreen;
