import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EstablishmentLoginScreen from "../screens/Establishment/EstablishmentLoginScreen";
import EstablishmentRegisterScreen from "../screens/Establishment/EstablishmentRegisterScreen";
import EstablishmentHomeScreen from "../screens/Establishment/EstablishmentHomeScreen";
import ManageProductsScreen from "../screens/Establishment/ManageProductsScreen";
import AddProductScreen from "../screens/Establishment/AddProductScreen";
import EstablishmentProductDetailsScreen from "../screens/Establishment/EstablishmentProductDetailsScreen";
import ManageOrdersScreen from "../screens/Establishment/ManageOrdersScreen";
import EstablishmentOrderDetailsScreen from "../screens/Establishment/EstablishmentOrderDetailsScreen";
import EstablishmentProfileScreen from "../screens/Establishment/EstablishmentProfileScreen";

export type EstablishmentAuthStackParamList = {
  EstablishmentLogin: undefined;
  EstablishmentRegister: undefined;
};

export type EstablishmentStackParamList = {
  EstablishmentHome: undefined;
  ManageProducts: undefined;
  AddProduct: undefined;
  EstablishmentProductDetails: { productId: string };
  ManageOrders: undefined;
  EstablishmentOrderDetails: { orderId: string };
  EstablishmentProfile: undefined;
};

const EstablishmentAuthStack =
  createNativeStackNavigator<EstablishmentAuthStackParamList>();
const EstablishmentStack =
  createNativeStackNavigator<EstablishmentStackParamList>();

export const EstablishmentAuthNavigator = () => {
  return (
    <EstablishmentAuthStack.Navigator screenOptions={{ headerShown: false }}>
      <EstablishmentAuthStack.Screen
        name="EstablishmentLogin"
        component={EstablishmentLoginScreen}
      />
      <EstablishmentAuthStack.Screen
        name="EstablishmentRegister"
        component={EstablishmentRegisterScreen}
      />
    </EstablishmentAuthStack.Navigator>
  );
};

export const EstablishmentAppNavigator = () => {
  return (
    <EstablishmentStack.Navigator screenOptions={{ headerShown: false }}>
      <EstablishmentStack.Screen
        name="EstablishmentHome"
        component={EstablishmentHomeScreen}
      />
      <EstablishmentStack.Screen
        name="ManageProducts"
        component={ManageProductsScreen}
      />
      <EstablishmentStack.Screen
        name="AddProduct"
        component={AddProductScreen}
      />
      <EstablishmentStack.Screen
        name="EstablishmentProductDetails"
        component={EstablishmentProductDetailsScreen}
      />
      <EstablishmentStack.Screen
        name="ManageOrders"
        component={ManageOrdersScreen}
      />
      <EstablishmentStack.Screen
        name="EstablishmentOrderDetails"
        component={EstablishmentOrderDetailsScreen}
      />
      <EstablishmentStack.Screen
        name="EstablishmentProfile"
        component={EstablishmentProfileScreen}
      />
    </EstablishmentStack.Navigator>
  );
};
