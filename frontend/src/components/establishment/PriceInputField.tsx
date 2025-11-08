// PriceInputField.tsx

import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface PriceInputFieldProps {
  formData: {
    sellingPrice: string;
    cmedPrice: number;
  };
  priceError: string;
  handlePriceChange: (text: string) => void;
  colors: any;
}

const PriceInputField: React.FC<PriceInputFieldProps> = ({
  formData,
  priceError,
  handlePriceChange,
  colors,
}) => {
  const styles = getStyles(colors);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Preço de Venda (R$) *
      </Text>
      <TextInput
        style={[styles.input, priceError ? styles.inputError : {}]}
        value={formData.sellingPrice}
        onChangeText={handlePriceChange}
        keyboardType="numeric"
        placeholder="R$ 0,00"
        editable={!!formData.cmedPrice} // Só permite edição se o preço CMED for conhecido
      />

      {/* Mensagem de erro */}
      {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    inputContainer: {
      gap: 4,
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 15,
      height: 50,
      backgroundColor: colors.white,
      fontSize: 16,
    },
    inputError: {
      borderColor: "#d9534f",
      borderWidth: 2,
    },
    errorText: {
      color: "#d9534f",
      fontSize: 12,
      marginTop: 5,
      marginBottom: 10,
      fontWeight: "500",
    },
  });

export default PriceInputField;
