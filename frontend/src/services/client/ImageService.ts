import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { API_URL } from "../../api/api";
import { getAuthToken } from "../common/AuthService"; // 👈 importa aqui

// Escolher imagem
export const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
};

// Enviar imagem
export const uploadImage = async (
  uri: string,
  type: "users" | "stores" | "products",
  idestabelecimento: string
) => {
  const endpoint =
    type === "users"
      ? "profile-image"
      : type === "stores"
      ? "store-logo"
      : "product-images";

  const fieldName =
    type === "users"
      ? "profileImage"
      : type === "stores"
      ? "storeLogo"
      : "productImages";

  const uploadUrl = `${API_URL}/upload/${endpoint}`;

  const formData = new FormData();
  formData.append(fieldName, {
    uri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as any);

  // Adiciona parâmetros extras (ex: id do usuário/produto)
  formData.append("idestabelecimento", idestabelecimento);

  try {
    const token = await getAuthToken(); // pega o token salvo
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Erro no upload");
    return json;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
};
