import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { EstablishmentAuthStackParamList } from "../../navigation/EstablishmentNavigator";
import MaskedInput from "../../components/common/MaskedInput";
import Button from "../../components/common/Button";
import {
  getAuthToken,
  getEstablishmentId,
  loginEstablishment,
} from "../../services/common/AuthService";

type EstablishmentLoginScreenNavigationProp = StackNavigationProp<
  EstablishmentAuthStackParamList,
  "EstablishmentLogin"
>;

interface EstablishmentLoginScreenProps {
  navigation: EstablishmentLoginScreenNavigationProp;
}

const EstablishmentLoginScreen: React.FC<EstablishmentLoginScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      console.log("Iniciando login...");
      console.log("=== INICIANDO LOGIN ===");
      console.log("Email/CNPJ:", email);
      console.log("Senha:", password);
      const response = await loginEstablishment(email, password);

      console.log("Login bem-sucedido:", response);
      console.log("=== LOGIN BEM-SUCEDIDO ===");
      console.log("Token:", response.token);
      console.log("Estabelecimento:", response.estabelecimento);

      // Verificar se os dados foram salvos
      const token = await getAuthToken();
      const establishmentId = await getEstablishmentId();

      console.log("=== DADOS SALVOS ===");
      console.log("Token salvo:", token);
      console.log("ID salvo:", establishmentId);

      Alert.alert("Sucesso", "Login realizado com sucesso!");

      // Navegar para o app do estabelecimento
      // Usamos getParent() para navegar entre navigators diferentes
      navigation.getParent()?.navigate("EstablishmentApp");
    } catch (error: any) {
      console.error("Erro detalhado no login:", error);
      console.error("=== ERRO NO LOGIN ===");
      console.error("Tipo do erro:", typeof error);
      console.error("Mensagem:", error.message);
      console.error("Response:", error.response);
      console.error("Request:", error.request);

      let errorMessage =
        "Ocorreu um erro ao tentar fazer login. Verifique suas credenciais e tente novamente.";

      if (error.response) {
        // Erro da API
        if (error.response.status === 401) {
          errorMessage = "Credenciais inválidas. Verifique seu email e senha.";
        } else if (error.response.status === 404) {
          errorMessage = "Estabelecimento não encontrado.";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage =
          "Erro de conexão. Verifique sua internet e tente novamente.";
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerImageContainer}>
        {/* Placeholder for image */}
        <Image
          source={require("../../../design_references/establishment_login_screen.webp")}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>PharmaGo - Estabelecimento</Text>
        <MaskedInput
          placeholder="Email / CNPJ / CPF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          iconName="mail-outline"
        />
        <MaskedInput
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          iconName="lock-closed-outline"
        />
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
        </TouchableOpacity>
        <Button title="Login" onPress={handleLogin} loading={loading} />
        <TouchableOpacity
          onPress={() => navigation.navigate("EstablishmentRegister")}
        >
          <Text style={styles.registerText}>Registrar-se</Text>
        </TouchableOpacity>
        <Text style={styles.socialLoginText}>Logar-se com</Text>
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../../design_references/google_icon.png")}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../../design_references/apple_icon.png")}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerImageContainer: {
    width: "100%",
    height: Dimensions.get("window").height * 0.3,
    backgroundColor: "#e0f2f7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerImage: {
    width: "80%",
    height: "80%",
  },
  formContainer: {
    width: "85%",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  forgotPassword: {
    textAlign: "right",
    color: "#007bff",
    marginBottom: 20,
  },
  registerText: {
    textAlign: "center",
    color: "#007bff",
    marginTop: 15,
    fontSize: 16,
  },
  socialLoginText: {
    textAlign: "center",
    marginTop: 30,
    marginBottom: 15,
    color: "#666",
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: {
    width: 30,
    height: 30,
  },
});

export default EstablishmentLoginScreen;
