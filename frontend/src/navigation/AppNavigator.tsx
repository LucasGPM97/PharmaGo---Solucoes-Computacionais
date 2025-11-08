import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import ClientNavigator from "./ClientNavigator";
import { EstablishmentAppNavigator } from "./EstablishmentNavigator";

export type RootStackParamList = {
  Auth: undefined;
  App: undefined; // Main client app
  EstablishmentApp: undefined; // Main establishment app
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="App" component={ClientNavigator} />
        <RootStack.Screen
          name="EstablishmentApp"
          component={EstablishmentAppNavigator}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
