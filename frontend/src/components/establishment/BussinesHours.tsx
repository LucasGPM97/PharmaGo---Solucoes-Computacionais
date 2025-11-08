import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MaskedInput from "../common/MaskedInput"; // Presumido
import { storeService } from "../../services/establishment/storeService"; // Presumido
import { Estabelecimento } from "../../types"; // Tipos presumidos
import { getEstablishmentId } from "../../services/common/AuthService";

// Se DaySchedule não estiver em um arquivo de types:
export type DaySchedule = {
  id: string; // ID interno usado no componente (1-7)
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  idhorario_funcionamento?: number;
  dia: number; // 0=Domingo, 1=Segunda, etc.
};

type BusinessHoursModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave?: (schedule: DaySchedule[]) => void;
  // A prop establishmentId foi REMOVIDA
};

// Mapeia a resposta da API (que usa números para dias) para o estado do componente (que usa strings)
const mapApiToSchedule = (
  apiSchedule: Estabelecimento["horario_funcionamento"]
): DaySchedule[] => {
  const dayNames: { [key: number]: string } = {
    0: "Domingo",
    1: "Segunda-feira",
    2: "Terça-feira",
    3: "Quarta-feira",
    4: "Quinta-feira",
    5: "Sexta-feira",
    6: "Sábado",
  };

  const scheduleMap = new Map(apiSchedule.map((h) => [h.dia, h]));

  return Array.from({ length: 7 }, (_, i) => {
    const apiDay = scheduleMap.get(i);
    const dayName = dayNames[i];

    // Fallback para horários padrão se a API não retornar o dia
    const defaultTime = "09:00";
    const defaultCloseTime = "18:00";

    return {
      id: (i + 1).toString(),
      day: dayName,
      dia: i,
      isOpen: apiDay ? !apiDay.fechado : false,
      openTime: apiDay?.horario_abertura?.substring(0, 5) || defaultTime,
      closeTime:
        apiDay?.horario_fechamento?.substring(0, 5) || defaultCloseTime,
      idhorario_funcionamento: apiDay?.idhorario_funcionamento,
    };
  }).sort((a, b) => a.dia - b.dia);
};

const BusinessHoursModal: React.FC<BusinessHoursModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentEstablishmentId, setCurrentEstablishmentId] = useState<
    number | null
  >(null);

  // --- Funções de Carregamento ---
  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    let idEstabelecimento: number | null = null;

    try {
      idEstabelecimento = await getEstablishmentId();

      if (!idEstabelecimento) {
        Alert.alert("Erro", "ID do estabelecimento não encontrado.");
        setLoading(false);
        return;
      }
      setCurrentEstablishmentId(idEstabelecimento);

      // 2. BUSCA OS DADOS DO ESTABELECIMENTO E HORÁRIOS
      const storeData = await storeService.getStoreById(idEstabelecimento);

      if (
        storeData.horario_funcionamento &&
        storeData.horario_funcionamento.length > 0
      ) {
        const mappedSchedule = mapApiToSchedule(
          storeData.horario_funcionamento
        );
        setSchedule(mappedSchedule);
      } else {
        // Se a API não retornou horários, usa o default (e o backend criará na 1ª vez)
        Alert.alert(
          "Atenção",
          "Horários padrão não encontrados. Use os horários pré-definidos."
        );
        // Define o estado inicial se não houver dados, usando o ID e Dia
        // (Você deve adaptar isso para gerar IDs temporários se necessário)
        setSchedule(mapApiToSchedule([]));
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      Alert.alert(
        "Erro",
        "Não foi possível carregar os horários de funcionamento."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchSchedule();
    }
  }, [visible, fetchSchedule]);

  const normalizeTime = (time: string): string => {
    // Se vier "1000" → vira "10:00"
    if (/^\d{3,4}$/.test(time)) {
      const hours = time.slice(0, -2);
      const minutes = time.slice(-2);
      time = `${hours.padStart(2, "0")}:${minutes}`;
    }

    // Se vier "10:00" → vira "10:00:00"
    if (/^\d{2}:\d{2}$/.test(time)) {
      return `${time}:00`;
    }

    // Se já estiver completo "10:00:00" → mantém
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time;
    }

    // Valor inválido → fallback seguro
    return "09:00:00";
  };
  // --- Funções de API para Salvar ---
  const handleSave = async () => {
    if (!currentEstablishmentId) {
      Alert.alert("Erro", "Impossível salvar. ID do estabelecimento ausente.");
      return;
    }

    setSaving(true);
    try {
      // Mapeia o estado do componente para o formato esperado pelo backend
      const updates = schedule.map((day) => {
        return {
          idhorario_funcionamento: day.idhorario_funcionamento,
          fechado: !day.isOpen,
          horario_abertura: normalizeTime(day.openTime),
          horario_fechamento: normalizeTime(day.closeTime),
          dia: day.dia,
        };
      });

      // Chama a API para salvar, usando o ID obtido do AsyncStorage
      await storeService.updateBusinessHours(currentEstablishmentId, updates);

      Alert.alert("Sucesso", "Horários de funcionamento salvos com sucesso!");

      if (onSave) onSave(schedule);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      Alert.alert("Erro", "Falha ao salvar horários. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // --- Funções de Estado (State Handlers) ---
  const toggleDayStatus = (id: string) => {
    setSchedule((prev) =>
      prev.map((day) => (day.id === id ? { ...day, isOpen: !day.isOpen } : day))
    );
  };

  const updateTime = (
    id: string,
    time: string,
    field: "openTime" | "closeTime"
  ) => {
    setSchedule((prev) =>
      prev.map((day) => (day.id === id ? { ...day, [field]: time } : day))
    );
  };

  // --- Renderização (Mantida) ---
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Horário de Funcionamento</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDayRow = (day: DaySchedule) => (
    <View key={day.id} style={styles.dayRow}>
      <View style={styles.dayHeader}>
        <View style={styles.dayInfo}>
          <Text style={styles.dayName}>{day.day}</Text>
          <Text
            style={[
              styles.dayStatus,
              day.isOpen ? styles.dayStatusOpen : styles.dayStatusClosed,
            ]}
          >
            {day.isOpen ? "Aberto" : "Fechado"}
          </Text>
        </View>
        <Switch
          value={day.isOpen}
          onValueChange={() => toggleDayStatus(day.id)}
          trackColor={{ false: "#e2e8f0", true: "#0d59f2" }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View
        style={[styles.timeInputs, !day.isOpen && styles.timeInputsDisabled]}
      >
        <View style={styles.timeInput}>
          <Text style={styles.timeLabel}>Abre às</Text>
          <MaskedInput
            keyboardType="numeric"
            style={[styles.input, !day.isOpen && styles.inputDisabled]}
            value={day.openTime}
            onChangeText={(text: string) =>
              updateTime(day.id, text, "openTime")
            }
            editable={day.isOpen}
            placeholder="09:00"
            placeholderTextColor="#94a3b8"
            maskType="time"
          />
        </View>

        <View style={styles.timeInput}>
          <Text style={styles.timeLabel}>Fecha às</Text>
          <MaskedInput
            maskType="time"
            keyboardType="numeric"
            style={[styles.input, !day.isOpen && styles.inputDisabled]}
            value={day.closeTime}
            onChangeText={(text: string) =>
              updateTime(day.id, text, "closeTime")
            }
            editable={day.isOpen}
            placeholder="18:00"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onClose}
        disabled={saving}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving || loading}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Horário</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity
          style={styles.backgroundDimmer}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.bottomSheet}>
          {renderHeader()}

          <Text style={styles.description}>
            Configure os horários de funcionamento para cada dia da semana.
          </Text>

          <View style={styles.scrollContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0d59f2" />
                <Text style={styles.loadingText}>Carregando horários...</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {schedule.map(renderDayRow)}
              </ScrollView>
            )}
          </View>

          {renderFooter()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backgroundDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  bottomSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "90%",
    flex: 1, // ADICIONEI FLEX 1 AQUI
  },
  handleContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#dbdfe6",
  },
  header: {
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111318",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f6f8",
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1, // ADICIONEI FLEX 1 AQUI TAMBÉM
  },
  scrollView: {
    flex: 1, // E AQUI
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 16, // ADICIONEI PADDING BOTTOM
  },
  dayRow: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    gap: 12,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayInfo: {
    gap: 4,
  },
  dayName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111318",
  },
  dayStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  dayStatusOpen: {
    color: "#0d59f2",
  },
  dayStatusClosed: {
    color: "#64748b",
  },
  timeInputs: {
    flexDirection: "row",
    gap: 12,
  },
  timeInputsDisabled: {
    opacity: 0.5,
  },
  timeInput: {
    flex: 1,
    gap: 8,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111318",
  },
  inputDisabled: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#0d59f2",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
});

export default BusinessHoursModal;
