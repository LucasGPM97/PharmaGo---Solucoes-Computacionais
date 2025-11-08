import React, { useEffect, useState } from "react";
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  KeyboardTypeOptions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { applyMask, MaskType } from "../../types/common/mask";

interface MaskedInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  maskType?: MaskType;
  label?: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  variant?: "default" | "compact";
  editable?: boolean;
}

const MASK_RAW_LENGTHS: Record<MaskType, number> = {
  cnpj: 14,
  cpf: 11,
  phone: 11,
  cep: 8,
  brl: 14,
  creditCard: 16,
  cardExpiry: 4,
  cvv: 3,
  date: 8,
  time: 4,
};

const MaskedInput: React.FC<MaskedInputProps> = ({
  placeholder,
  value: rawValueFromParent,
  onChangeText,
  maskType,
  label,
  error,
  iconName,
  autoCapitalize = "none",
  secureTextEntry,
  keyboardType: externalKeyboardType,
  variant = "default",
  editable = true,
}) => {
  const [isTextSecure, setIsTextSecure] = useState(secureTextEntry);
  const [isEditable, setIsEditable] = useState(editable);
  const isPasswordField = secureTextEntry !== undefined;
  const toggleIcon = isTextSecure ? "eye-off" : "eye";

  const getCalculatedKeyboardType = (type?: MaskType): KeyboardTypeOptions => {
    if (!type) return "default";

    if (
      type === "brl" ||
      type === "cpf" ||
      type === "phone" ||
      type === "cnpj" ||
      type === "cep" ||
      type === "creditCard" ||
      type === "cardExpiry" ||
      type === "cvv" ||
      type === "date" ||
      type === "time"
    ) {
      return "numeric";
    }
    return "default";
  };
  const finalKeyboardType =
    externalKeyboardType || getCalculatedKeyboardType(maskType);

  const getCleanValue = (text: string, maskType?: MaskType): string => {
    // Se não há máscara, retorna o texto original (para email, nome, etc.)
    if (!maskType) {
      return text;
    }

    // Para campos monetários, tratamento específico
    if (maskType === "brl") {
      let cleaned = text
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim();
      if (cleaned === "0.00" || cleaned === "") return "";
      if (cleaned.endsWith(".")) cleaned = cleaned.slice(0, -1);
      return cleaned;
    }

    // Para outros campos mascarados, remove apenas caracteres não numéricos
    return text.replace(/\D/g, "");
  };

  const initialMaskedValue = maskType
    ? applyMask(rawValueFromParent.replace(/\D/g, ""), maskType)
    : rawValueFromParent;

  const [maskedValue, setMaskedValue] = useState(initialMaskedValue);

  useEffect(() => {
    const newMaskedValue = maskType
      ? applyMask(rawValueFromParent.replace(/\D/g, ""), maskType)
      : rawValueFromParent;
    setMaskedValue(newMaskedValue);
  }, [rawValueFromParent, maskType]);

  const handleTextChange = (text: string) => {
    let digitsOnly = text;
    let maskedTextForView = text;

    if (maskType) {
      // Para campos mascarados, remove caracteres não numéricos e aplica limite
      digitsOnly = text.replace(/\D/g, "");
      const maxLength = MASK_RAW_LENGTHS[maskType];
      if (maxLength) {
        digitsOnly = digitsOnly.substring(0, maxLength);
      }
      maskedTextForView = applyMask(digitsOnly, maskType);
    }

    // Para campos sem máscara (email, nome), mantém o texto original
    const rawText = !maskType
      ? text
      : maskType === "brl"
      ? getCleanValue(maskedTextForView, maskType)
      : getCleanValue(digitsOnly, maskType);

    setMaskedValue(maskedTextForView);
    onChangeText(rawText);
  };

  return (
    <View
      style={[
        maskedInputStyles.container,
        variant === "compact" && maskedInputStyles.compactContainer,
      ]}
    >
      {label && <Text style={maskedInputStyles.label}>{label}</Text>}
      <View
        style={[
          maskedInputStyles.inputWrapper,
          error && maskedInputStyles.inputError,
          variant === "compact" && maskedInputStyles.compactInputWrapper,
        ]}
      >
        <TextInput
          style={[
            maskedInputStyles.input,
            variant === "compact" && maskedInputStyles.compactInputText,
          ]}
          placeholder={placeholder}
          value={maskedValue}
          onChangeText={handleTextChange}
          keyboardType={finalKeyboardType}
          placeholderTextColor="#999"
          autoCapitalize={autoCapitalize}
          dataDetectorTypes="none"
          autoCorrect={false}
          secureTextEntry={isTextSecure}
          editable={isEditable}
        />
        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setIsTextSecure(!isTextSecure)}
            style={maskedInputStyles.toggleButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={toggleIcon} size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={maskedInputStyles.errorText}>{error}</Text>}
    </View>
  );
};

// ... (os estilos permanecem os mesmos)

const maskedInputStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 55,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: "100%",
    paddingLeft: 5,
  },
  inputError: {
    borderColor: "#dc3545",
    borderWidth: 2,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 5,
  },
  icon: {
    marginRight: 10,
  },
  toggleButton: {
    paddingLeft: 10,
  },
  compactInputWrapper: {
    height: 44,
    paddingHorizontal: 8,
    borderRadius: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  compactContainer: {
    marginBottom: 0,
  },
  compactInputText: {
    textAlign: "right",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MaskedInput;
