import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ConfirmPaymentDeletionScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Exclusão de Pagamento</Text>
      {/* Conteúdo para confirmar exclusão de pagamento */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default ConfirmPaymentDeletionScreen;
