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

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
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
              onChangeText={setName}
              iconName="person-outline"
            />
            <MaskedInput
              label="Email"
              placeholder="name@email.com"
              value={email}
              onChangeText={setEmail}
              iconName="mail-outline"
              keyboardType="email-address"
            />
            <MaskedInput
              label="Documento de Identificação"
              placeholder="RG / CPF"
              value={document}
              onChangeText={setDocument}
              iconName="document-outline"
              maskType="cpf"
            />
            <MaskedInput
              label="Número de Contato"
              placeholder="(xx) xxxxx-xxxx"
              value={contactNumber}
              onChangeText={setContactNumber}
              iconName="call-outline"
              maskType="phone"
            />
            <DateInput
              label="Data de Nascimento"
              value={date}
              onChange={setDate}
              error={!date ? "Campo obrigatório" : undefined}
            />
            <MaskedInput
              label="Senha"
              placeholder="Crie sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              iconName="lock-closed-outline"
            />
            <MaskedInput
              label="Confirme sua senha"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
});

export default RegisterScreen;
