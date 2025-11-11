import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

interface DateInputProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  editable?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error,
  iconName = "calendar-outline",
  editable = true,
}) => {
  const getInitialDate = () => {
    if (!value) return new Date();

    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const [date, setDate] = useState<Date>(getInitialDate());
  const [showPicker, setShowPicker] = useState(false);

  const maxDate = new Date();
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);

    if (selectedDate) {
      setDate(selectedDate);

      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;
      onChange?.(formattedDate);
    }
  };

  const showDatePicker = () => {
    if (!editable) return;
    setShowPicker(true);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Selecione a data de nascimento";

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity 
        onPress={showDatePicker} 
        activeOpacity={editable ? 0.7 : 1}
        disabled={!editable}
      >
        <View
          style={[
            styles.inputWrapper,
            error && styles.inputError,
            !editable && styles.inputDisabled,
          ]}
        >
          <Ionicons
            name={iconName}
            size={20}
            color={editable ? "#666" : "#999"}
            style={styles.icon}
          />
          <Text style={[
            styles.dateText,
            !value && styles.placeholderText,
            !editable && styles.textDisabled,
          ]}>
            {value
              ? formatDisplayDate(value)
              : "Selecione a data de nascimento"}
          </Text>
        </View>
      </TouchableOpacity>

      {showPicker && editable && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={onChangeDate}
          maximumDate={maxDate}
          minimumDate={minDate}
          locale="pt-BR"
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontWeight: "bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  inputDisabled: {
    backgroundColor: "#f8f8f8",
    borderColor: "#e0e0e0",
    opacity: 0.7,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  textDisabled: {
    color: "#888",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  icon: {
    marginRight: 8,
  },
});

export default DateInput;