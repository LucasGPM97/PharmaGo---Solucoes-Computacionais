// components/common/Header.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientStackParamList } from "../../navigation/ClientNavigator";

type HeaderNavigationProp = NativeStackNavigationProp<ClientStackParamList>;

interface HeaderProps {
  showLocation?: boolean;
  showSearchIcon?: boolean;
  showCartIcon?: boolean;
  onSearchPress?: () => void;
  onCartPress?: () => void;
  customLeftComponent?: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  customRightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  showLocation = false,
  showSearchIcon = false,
  showCartIcon = false,
  onSearchPress,
  onCartPress,
  customLeftComponent,
  title,
  showBackButton = false,
  onBackPress,
  customRightComponent,
}) => {
  const navigation = useNavigation<HeaderNavigationProp>();

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate("Search");
    }
  };

  const handleCartPress = () => {
    if (onCartPress) {
      onCartPress();
    } else {
      navigation.navigate("Cart");
    }
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      {/* Left Side */}
      <View style={styles.headerLeft}>
        {showBackButton ? (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        ) : customLeftComponent ? (
          customLeftComponent
        ) : showLocation ? (
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={20} color="#6B7280" />
            <Text style={styles.locationText}>sua localização</Text>
          </View>
        ) : null}
      </View>

      {/* Center (title) */}
      {title && (
        <View style={styles.headerCenter}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      {/* Right Side */}
      <View style={styles.headerIcons}>
        {customRightComponent ? (
          customRightComponent
        ) : (
          <>
            {showSearchIcon && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleSearchPress}
              >
                <MaterialIcons name="search" size={24} color="#111827" />
              </TouchableOpacity>
            )}
            {showCartIcon && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleCartPress}
              >
                <MaterialIcons name="shopping-bag" size={24} color="#111827" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    height: 56,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});

export default Header;
