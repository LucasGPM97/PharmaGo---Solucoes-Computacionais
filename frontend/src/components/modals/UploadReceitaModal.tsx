// screens/Client/UploadReceitaModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import Header from "../../components/common/Header"; // Reutilizando seu Header
import { ReceitaService } from "../../services/common/ReceitaService"; // Importa o novo serviço

// Importando os tipos do seu arquivo de serviço
import { CartItem } from "../../services/client/CartService";

// Define os tipos para as rotas e assets
type RouteParams = {
  cartItems: CartItem[];
  total: number;
};

type DocumentAsset = DocumentPicker.DocumentPickerAsset | null;

const UploadReceitaModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, total } = route.params as RouteParams;

  const [selectedFile, setSelectedFile] = useState<DocumentAsset>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Verifica se a receita é *realmente* obrigatória (se algum item assim o exige)
  const isPrescriptionRequired = cartItems.some((item) => item.requer_receita);

  // Lista de itens que requerem receita para exibir ao usuário
  const itemsRequiringPrescription = cartItems
    .filter((item) => item.requer_receita)
    .map((item) => item.name);

  const pickDocument = async () => {
    if (isUploading) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"], // Permite PDF, JPEG e PNG
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        // Seleciona o primeiro arquivo
        setSelectedFile(result.assets[0]);
      } else {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Erro ao selecionar documento:", error);
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  };

  const handleConfirm = async () => {
    if (isUploading) return;

    if (isPrescriptionRequired && !selectedFile) {
      Alert.alert(
        "Atenção",
        "Você deve anexar a receita médica para continuar com a compra dos produtos requeridos."
      );
      return;
    }

    if (selectedFile) {
      // ⚠️ IMPORTANTE: Em um fluxo real, você criaria o Pedido (Order) PRIMEIRO,
      // obteria o ID do pedido e usaria esse ID na função uploadReceita.
      // Por simplicidade, usaremos um ID de pedido fictício 'pending_order_id'.
      // Você deve adaptar isso para o seu fluxo real de criação de pedido.
      const TEMP_PEDIDO_ID = "0";

      setIsUploading(true);
      try {
        // Aqui chamamos o serviço para enviar o arquivo
        await ReceitaService.uploadReceita(selectedFile, TEMP_PEDIDO_ID);
        Alert.alert(
          "Sucesso",
          "Receita enviada com sucesso! Prossiga para o endereço."
        );
      } catch (error) {
        Alert.alert(
          "Erro no Upload",
          "Ocorreu um erro ao enviar a receita. Tente novamente."
        );
        // Não prossegue se o upload falhar
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Navega para o próximo passo do checkout
    navigation.navigate("ConfirmAddress", {
      cartItems,
      total,
      receitaAnexada: !!selectedFile, // Indica que a receita foi anexada/confirmada
    });
  };

  return (
    <View style={styles.modalBackground}>
      <SafeAreaView style={styles.container}>
        <Header
          title="Anexar Receita Médica"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.content}>
          <MaterialIcons
            name="local-hospital"
            size={50}
            color="#007AFF"
            style={styles.icon}
          />

          <Text style={styles.title}>
            {isPrescriptionRequired
              ? "Receita Médica Necessária"
              : "Anexar Receita (Opcional)"}
          </Text>

          <Text style={styles.description}>
            {isPrescriptionRequired
              ? `Os seguintes produtos exigem uma receita médica: ${itemsRequiringPrescription.join(
                  ", "
                )}. Por favor, anexe o documento.`
              : "Alguns itens podem exigir receita. Você pode anexá-la agora ou na retirada/entrega, se necessário."}
          </Text>

          {/* Visualização do Arquivo Selecionado */}
          {selectedFile ? (
            <View style={styles.fileContainer}>
              <MaterialIcons
                name="insert-drive-file"
                size={24}
                color="#10B981"
              />
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedFile(null)}
                disabled={isUploading}
              >
                <MaterialIcons name="close" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickDocument}
              disabled={isUploading}
            >
              <MaterialIcons name="cloud-upload" size={24} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>
                {isUploading
                  ? "Enviando..."
                  : "Selecionar Arquivo (PDF, JPG, PNG)"}
              </Text>
              {isUploading && (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={{ marginLeft: 10 }}
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Footer/Ações */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              isUploading && styles.disabledButton,
            ]}
            onPress={handleConfirm}
            disabled={isUploading || (isPrescriptionRequired && !selectedFile)}
          >
            <Text style={styles.continueButtonText}>
              {isPrescriptionRequired && !selectedFile
                ? "Anexe a Receita para Prosseguir"
                : "Continuar para Endereço"}
            </Text>
          </TouchableOpacity>

          {!isPrescriptionRequired && (
            <TouchableOpacity style={styles.skipButton} onPress={handleConfirm}>
              <Text style={styles.skipButtonText}>Pular por enquanto</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Cor de fundo do modal
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  icon: {
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  uploadButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    width: "90%",
    justifyContent: "space-between",
  },
  fileName: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  continueButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  skipButton: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default UploadReceitaModal;
