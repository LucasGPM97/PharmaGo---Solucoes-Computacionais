// components/common/TimeInput.tsx
import React from "react";
import MaskedInput from "./MaskedInput";

interface TimeInputProps {
  label?: string;
  value: string; // Formato do banco: "HH:MM:SS"
  onChange: (time: string) => void; // Retorna formato do banco: "HH:MM:SS"
  error?: string;
  placeholder?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder = "00:00",
}) => {
  // Converte do formato do banco para exibição
  const formatForDisplay = (dbTime: string): string => {
    if (!dbTime) return "";
    const [hours, minutes] = dbTime.split(":");
    return `${hours || "00"}${minutes || "00"}`;
  };

  // Converte da exibição para o formato do banco
  const formatForDB = (displayTime: string): string => {
    if (!displayTime) return "";
    const padded = displayTime.padEnd(4, "0");
    return `${padded.substring(0, 2)}:${padded.substring(2, 4)}:00`;
  };

  const handleChange = (rawValue: string) => {
    const dbTime = formatForDB(rawValue);
    onChange(dbTime);
  };

  return (
    <MaskedInput
      label={label}
      value={formatForDisplay(value)}
      onChangeText={handleChange}
      maskType="time"
      placeholder={placeholder}
      iconName="time-outline"
      error={error}
    />
  );
};

export default TimeInput;
