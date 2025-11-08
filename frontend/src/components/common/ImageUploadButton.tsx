import React from "react";
import { Button, Alert } from "react-native";
import { pickImage, uploadImage } from "../../services/client/ImageService";

interface ImageUploadButtonProps {
  onImageUpload: (imageUrl: string) => void;
  type: "users" | "stores" | "products";
  id: string;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  onImageUpload,
  type,
  id,
}) => {
  const handleImagePickAndUpload = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      try {
        const response = await uploadImage(imageUri, type, id);
        if (response && response.imageUrl) {
          onImageUpload(response.imageUrl);
          Alert.alert("Sucesso", "Imagem enviada com sucesso!");
        } else {
          Alert.alert("Erro", "Falha ao obter URL da imagem.");
        }
      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        Alert.alert("Erro", "Falha ao enviar imagem.");
      }
    }
  };

  return (
    <Button
      title="Selecionar e Enviar Imagem"
      onPress={handleImagePickAndUpload}
    />
  );
};

export default ImageUploadButton;
