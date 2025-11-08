import React from "react";
import { View, Text, StyleSheet } from "react-native";

const OrderSuccessScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedido Realizado com Sucesso!</Text>
      {/* Conteúdo para confirmação de pedido */}
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

export default OrderSuccessScreen;
