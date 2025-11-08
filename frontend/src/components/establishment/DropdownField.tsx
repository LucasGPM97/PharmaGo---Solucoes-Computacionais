// DropdownField.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import DropDownPicker, { ItemType } from "react-native-dropdown-picker";

interface DropdownFieldProps {
  label: string;
  zIndex: number;
  open: boolean;
  value: string | null;
  items: ItemType[];
  setOpen: (open: boolean) => void;
  setValue: (callback: (value: string | null) => string | null) => void;
  placeholder: string;
  disabled: boolean;
  colors: any;
  modalTitle: string;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  zIndex,
  open,
  value,
  items,
  setOpen,
  setValue,
  placeholder,
  disabled,
  colors,
  modalTitle,
}) => {
  const styles = getStyles(colors, disabled);

  // Ajuste dinâmico do zIndex (zIndex alto quando aberto)
  const dynamicZIndex = open ? zIndex + 1000 : zIndex;

  return (
    <View style={[styles.inputContainer, { zIndex: dynamicZIndex }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label} *
      </Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        placeholder={placeholder}
        disabled={disabled}
        searchable={true}
        searchPlaceholder="Buscar..."
        searchTextInputStyle={styles.searchInput}
        style={styles.dropdown}
        textStyle={[
          styles.dropdownText,
          { color: value ? colors.text : colors.textSecondary },
        ]}
        dropDownContainerStyle={styles.dropdownContainer}
        listItemLabelStyle={styles.listItemLabel}
        placeholderStyle={styles.placeholderText}
        // Props de Modal para melhor UX
        listMode="MODAL"
        modalProps={{ animationType: "slide" }}
        modalTitle={modalTitle}
        modalContentContainerStyle={styles.modalContent}
        modalTitleStyle={styles.modalTitleStyle}
        closeOnBackPressed={true}
        // Ajuste de ZIndex para Modal
        zIndex={dynamicZIndex}
        zIndexInverse={10000 - dynamicZIndex} // Inverso para garantir ordem
      />
    </View>
  );
};

// Função para criar estilos (para injetar cores e desabilitar estado)
const getStyles = (colors: any, disabled: boolean) =>
  StyleSheet.create({
    inputContainer: {
      gap: 4,
      opacity: disabled ? 0.6 : 1, // Opacidade para estado disabled
    },
    label: {
      fontSize: 14,
      fontWeight: "500",
    },
    dropdown: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 16,
      minHeight: 48,
      backgroundColor: colors.grayLight,
      borderColor: colors.border,
    },
    dropdownText: {
      fontSize: 16,
    },
    dropdownContainer: {
      borderWidth: 1,
      borderRadius: 10,
      marginTop: 4,
      backgroundColor: colors.white,
      borderColor: colors.border,
    },
    listItemLabel: {
      fontSize: 16,
      color: colors.text,
    },
    placeholderText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    searchInput: {
      fontSize: 16,
      color: colors.text,
    },
    modalContent: {
      backgroundColor: colors.white,
    },
    modalTitleStyle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
  });

export default DropdownField;
