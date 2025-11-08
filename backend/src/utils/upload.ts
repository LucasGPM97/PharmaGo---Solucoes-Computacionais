import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Configuração do storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join("public", "uploads");

    if (file.fieldname === "profileImage") {
      uploadPath = path.join(uploadPath, "profiles");
    } else if (file.fieldname === "storeLogo") {
      uploadPath = path.join(uploadPath, "logos");
    } else if (file.fieldname === "productImages") {
      uploadPath = path.join(uploadPath, "products");
    } else if (file.fieldname === "receitaFile") {
      // 🛑 NOVO: Adicione sua nova rota
      uploadPath = path.join(uploadPath, "receitas"); // Use a pasta 'receitas'
    }

    // Cria a pasta se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gera um nome único + mantém a extensão original
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();

    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Filtro para aceitar apenas imagens
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "File upload only supports the following filetypes - jpeg, jpg, png, gif"
      )
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

export default upload;
