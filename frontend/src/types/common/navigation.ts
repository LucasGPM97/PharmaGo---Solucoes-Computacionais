// types/navigation.ts
import { ClientStackParamList } from "../../navigation/ClientNavigator";
import { EstablishmentStackParamList } from "../../navigation/EstablishmentNavigator";

export type TabType = "home" | "search" | "orders" | "profile";

// Tipos para as rotas do cliente
export type ClientScreenProps = {
  navigation: {
    navigate: <RouteName extends keyof ClientStackParamList>(
      screen: RouteName,
      params?: ClientStackParamList[RouteName]
    ) => void;
    goBack: () => void;
  };
};

// Tipos para as rotas do estabelecimento
export type EstablishmentScreenProps = {
  navigation: {
    navigate: <RouteName extends keyof EstablishmentStackParamList>(
      screen: RouteName,
      params?: EstablishmentStackParamList[RouteName]
    ) => void;
    goBack: () => void;
  };
};
