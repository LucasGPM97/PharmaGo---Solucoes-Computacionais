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
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      //teste
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
              onChangeText={setName}
              iconName="business-outline"
            />
            <MaskedInput
              label="Email"
              placeholder="loja@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              iconName="mail-outline"
            />
            <MaskedInput
              label="Responsável Técnico"
              placeholder="Fulano de Tal"
              value={name2}
              onChangeText={setName2}
              iconName="person-outline"
            />
            <MaskedInput
              label="Número de Contato"
              placeholder="(xx) xxxxx-xxxx"
              value={contactNumber}
              onChangeText={setContactNumber}
              iconName="call-outline"
              maskType="phone"
            />
            <MaskedInput
              label="CNPJ"
              placeholder="XX.XXX.XXX/XXXX-XX"
              value={cnpj}
              onChangeText={setCnpj}
              iconName="document-text-outline"
              maskType="cnpj"
            />
            <MaskedInput
              label="Registro ANVISA"
              placeholder="Ex: 123456789"
              value={registroAnvisa}
              onChangeText={setRegistroAnvisa}
              iconName="medkit-outline"
              keyboardType="numeric"
            />
            <MaskedInput
              label="Senha"
              placeholder="Crie sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              iconName="lock-closed-outline"
            />
            <MaskedInput
              label="Confirme sua senha"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
});

export default EstablishmentRegisterScreen;
