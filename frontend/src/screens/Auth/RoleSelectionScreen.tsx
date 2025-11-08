import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import Button from "../../components/common/Button";

type RoleSelectionScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "RoleSelection"
>;

interface RoleSelectionScreenProps {
  navigation: RoleSelectionScreenNavigationProp;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eu sou...</Text>
      <Button
        title="Cliente"
        onPress={() => navigation.navigate("Login")}
        style={styles.button}
      />
      <Button
        title="Estabelecimento"
        onPress={() => navigation.navigate("EstablishmentLogin")}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    color: "#333",
  },
  button: {
    width: "80%",
    marginBottom: 20,
  },
});

export default RoleSelectionScreen;
