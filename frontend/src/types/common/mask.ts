// maskUtils.ts

/**
 * Define os tipos de máscara disponíveis.
 */
export type MaskType =
  | "cpf"
  | "phone"
  | "cnpj"
  | "cep"
  | "brl"
  | "date"
  | "creditCard"
  | "cardExpiry"
  | "cvv"
  | "time";

/**
 * Aplica a máscara especificada ao valor de entrada.
 * @param value O valor de entrada (string).
 * @param maskType O tipo de máscara a ser aplicada.
 * @returns O valor formatado com a máscara.
 */
export const applyMask = (value: string, maskType: MaskType): string => {
  if (!value && maskType !== "brl") return "";

  let cleanedValue = value.replace(/\D/g, ""); // Remove all non-digits (padrão)

  // --- MÁSCARA PARA HORA ---
  if (maskType === "time") {
    // Hora: HH:MM (max 4 digits)
    cleanedValue = cleanedValue.substring(0, 4);
    let masked = "";
    if (cleanedValue.length > 0) masked += cleanedValue.substring(0, 2);
    if (cleanedValue.length > 2) masked += ":" + cleanedValue.substring(2, 4);
    return masked;
  }

  // --- MÁSCARAS DE PAGAMENTO/CHECKOUT ---
  if (maskType === "date") {
    // Data: DD/MM/AAAA (max 8 digits)
    cleanedValue = cleanedValue.substring(0, 8);
    let masked = "";
    if (cleanedValue.length > 0) masked += cleanedValue.substring(0, 2);
    if (cleanedValue.length > 2) masked += "/" + cleanedValue.substring(2, 4);
    if (cleanedValue.length > 4) masked += "/" + cleanedValue.substring(4, 8);
    return masked;
  }

  if (maskType === "creditCard") {
    // Cartão de Crédito: 9999 9999 9999 9999 (max 16 digits)
    cleanedValue = cleanedValue.substring(0, 16);
    let masked = "";
    if (cleanedValue.length > 0) masked += cleanedValue.substring(0, 4);
    if (cleanedValue.length > 4) masked += " " + cleanedValue.substring(4, 8);
    if (cleanedValue.length > 8) masked += " " + cleanedValue.substring(8, 12);
    if (cleanedValue.length > 12)
      masked += " " + cleanedValue.substring(12, 16);
    return masked;
  }

  if (maskType === "cardExpiry") {
    // Validade do Cartão (MM/AA): 99/99 (max 4 digits)
    cleanedValue = cleanedValue.substring(0, 4);
    let masked = "";
    if (cleanedValue.length > 0) masked += cleanedValue.substring(0, 2);
    if (cleanedValue.length > 2) masked += "/" + cleanedValue.substring(2, 4);
    return masked;
  }

  if (maskType === "cvv") {
    // CVV/CVC: 999 (max 3 digits)
    cleanedValue = cleanedValue.substring(0, 3);
    return cleanedValue;
  }

  // --- MÁSCARAS DE CADASTRO/ENDEREÇO/FINANCEIRO ---

  if (maskType === "cnpj") {
    // CNPJ: 99.999.999/9999-99
    cleanedValue = cleanedValue.substring(0, 14);
    let masked = "";
    if (cleanedValue.length > 0) masked += cleanedValue.substring(0, 2);
    if (cleanedValue.length > 2) masked += "." + cleanedValue.substring(2, 5);
    if (cleanedValue.length > 5) masked += "." + cleanedValue.substring(5, 8);
    if (cleanedValue.length > 8) masked += "/" + cleanedValue.substring(8, 12);
    if (cleanedValue.length > 12)
      masked += "-" + cleanedValue.substring(12, 14);
    return masked;
  }

  if (maskType === "cep") {
    // CEP: 99999-999
    cleanedValue = cleanedValue.substring(0, 8);
    let masked = "";
    if (cleanedValue.length > 0) masked += cleanedValue.substring(0, 5);
    if (cleanedValue.length > 5) masked += "-" + cleanedValue.substring(5, 8);
    return masked;
  }

  if (maskType === "brl") {
    // Preço BRL: R$ 99.999.999,99
    let rawDigits = value.replace(/\D/g, "");
    if (!rawDigits) return "R$ 0,00";
    rawDigits = rawDigits.replace(/^0+/, "");
    if (!rawDigits) return "R$ 0,00";
    rawDigits = rawDigits.substring(0, 14);
    while (rawDigits.length < 3) {
      rawDigits = "0" + rawDigits;
    }
    const integerPart = rawDigits.substring(0, rawDigits.length - 2);
    const decimalPart = rawDigits.substring(rawDigits.length - 2);
    const formattedIntegerPart = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );
    return `R$ ${formattedIntegerPart},${decimalPart}`;
  }

  if (maskType === "cpf") {
    // CPF: 999.999.999-99
    cleanedValue = cleanedValue.substring(0, 11);
    let masked = "";
    if (cleanedValue.length > 0) masked += cleanedValue.substring(0, 3);
    if (cleanedValue.length > 3) masked += "." + cleanedValue.substring(3, 6);
    if (cleanedValue.length > 6) masked += "." + cleanedValue.substring(6, 9);
    if (cleanedValue.length > 9) masked += "-" + cleanedValue.substring(9, 11);
    return masked;
  }

  if (maskType === "phone") {
    // Phone (Fixo/Cell): (99) 9999-9999 ou (99) 99999-9999
    cleanedValue = cleanedValue.substring(0, 11);

    let masked = "";
    const isMobile =
      cleanedValue.length === 11 && cleanedValue.substring(2, 3) === "9";
    const isCelular = cleanedValue.length > 10;
    if (cleanedValue.length > 0) masked += "(" + cleanedValue.substring(0, 2);
    if (cleanedValue.length > 2) masked += ") ";

    if (isCelular) {
      if (cleanedValue.length > 2) masked += cleanedValue.substring(2, 7);
      if (cleanedValue.length > 7)
        masked += "-" + cleanedValue.substring(7, 11);
    } else {
      if (cleanedValue.length > 2) masked += cleanedValue.substring(2, 6);
      if (cleanedValue.length > 6)
        masked += "-" + cleanedValue.substring(6, 10);
    }

    return masked;
  }

  return cleanedValue;
};
