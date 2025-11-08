import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Client/HomeScreen";
import EstablishmentDetailsScreen from "../screens/Client/EstablishmentDetailsScreen";
import ProductDetailsScreen from "../screens/Client/ProductDetailsScreen";
import CartScreen from "../screens/Client/CartScreen";
import PaymentScreen from "../screens/Client/PaymentScreen";
import MyOrdersScreen from "../screens/Client/MyOrdersScreen";
import ProfileScreen from "../screens/Client/ProfileScreen";
import SearchScreen from "../screens/Client/SearchScreen";
import ConfirmAddressScreen from "../screens/Client/ConfirmAddressScreen";
import OrderSummaryScreen from "../screens/Client/OrderSummaryScreen";
import OrderDetailsScreen from "../screens/Client/OrderDetailsScreen";
import OrderFeedScreen from "../screens/Client/OrderFeedScreen";
import AccountDetailsScreen from "../screens/Client/AccountDetailsScreen";
import PaymentManagementScreen from "../screens/Client/PaymentManagementScreen";
import AddressManagementScreen from "../screens/Client/AddressManagementScreen";
import ConfirmPaymentScreen from "../screens/Client/ConfirmPaymentScreen";
import { CartItem } from "../services/client/CartService";
import UploadReceitaModal from "../components/modals/UploadReceitaModal";

export type ClientStackParamList = {
  Home: undefined;
  EstablishmentDetails: { idestabelecimento: number };
  ProductDetails: { productId: number };
  Cart: undefined;
  Payment: undefined;
  MyOrders: undefined;
  Profile: undefined;
  Search: undefined;
  ConfirmAddress: {
    cartItems: CartItem[];
    total: number;
    receitaAnexada?: boolean;
  };
  
  OrderSummary: undefined;
  OrderDetails: { orderId: string };
  OrderFeed: undefined;
  AccountDetails: undefined;
  PaymentManagement: undefined;
  AddressManagement: undefined;
  ConfirmPaymentScreen: undefined;
  UploadReceitaModal: {
    cartItems: CartItem[];
    total: number;
  };
};

const ClientStack = createNativeStackNavigator<ClientStackParamList>();

const ClientNavigator = () => {
  return (
    <ClientStack.Navigator screenOptions={{ headerShown: false }}>
      <ClientStack.Screen name="Home" component={HomeScreen} />
      <ClientStack.Screen
        name="EstablishmentDetails"
        component={EstablishmentDetailsScreen}
      />
      <ClientStack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
      />
      <ClientStack.Screen name="Cart" component={CartScreen} />
      <ClientStack.Screen name="Payment" component={PaymentScreen} />
      <ClientStack.Screen name="MyOrders" component={MyOrdersScreen} />
      <ClientStack.Screen name="Profile" component={ProfileScreen} />
      <ClientStack.Screen name="Search" component={SearchScreen} />
      <ClientStack.Screen
        name="UploadReceita"
        component={UploadReceitaModal}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <ClientStack.Screen
        name="ConfirmAddress"
        component={ConfirmAddressScreen}
      />
      <ClientStack.Screen
        name="ConfirmPayment"
        component={ConfirmPaymentScreen}
      />
      <ClientStack.Screen name="OrderSummary" component={OrderSummaryScreen} />
      <ClientStack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <ClientStack.Screen name="OrderFeed" component={OrderFeedScreen} />
      <ClientStack.Screen
        name="AccountDetails"
        component={AccountDetailsScreen}
      />
      <ClientStack.Screen
        name="PaymentManagement"
        component={PaymentManagementScreen}
      />
      <ClientStack.Screen
        name="AddressManagement"
        component={AddressManagementScreen}
      />
    </ClientStack.Navigator>
  );
};

export default ClientNavigator;
