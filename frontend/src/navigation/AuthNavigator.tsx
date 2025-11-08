import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import RoleSelectionScreen from "../screens/Auth/RoleSelectionScreen";
import { EstablishmentAuthNavigator } from "./EstablishmentNavigator";

export type AuthStackParamList = {
  RoleSelection: undefined;
  Login: undefined;
  Register: undefined;
  EstablishmentLogin: undefined; // Adicionado para navegação direta
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      {/* A tela de login do estabelecimento já está no EstablishmentAuthNavigator, mas precisamos de uma rota aqui para navegação direta */}
      <AuthStack.Screen
        name="EstablishmentLogin"
        component={EstablishmentAuthNavigator}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
