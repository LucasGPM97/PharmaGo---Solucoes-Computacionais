import { Router, Request, Response } from "express";
import upload from "../utils/upload";
import authMiddleware from "../middlewares/authMiddleware";
import Cliente from "../models/Cliente";
import Estabelecimento from "../models/Estabelecimento";
import ImagemProduto from "../models/ImagemProduto";
import ReceitaMedicaService from "../services/ReceitaMedicaService";

const router = Router();

// Rota para upload de imagem de perfil do cliente
router.post(
  "/profile-image",
  authMiddleware,
  upload.single("profileImage"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
      }

      // Caminho da imagem (público)
      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      // ID do usuário autenticado (vem do authMiddleware)
      const userId = (req as any).user.id;

      // Atualiza o caminho da imagem no banco
      await Cliente.update(
        { profileImage: imageUrl },
        { where: { id: userId } },
      );

      res.status(200).json({
        message: "Upload de imagem de perfil realizado com sucesso!",
        imageUrl,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao salvar imagem no banco." });
    }
  },
);

// Rota para upload de logo do estabelecimento
router.post(
  "/store-logo",
  authMiddleware,
  upload.single("storeLogo"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
      }

      const imageUrl = `/uploads/logos/${req.file.filename}`;
      const storeId = req.body.idestabelecimento;

      if (!storeId) {
        return res
          .status(400)
          .json({ message: "ID do estabelecimento não fornecido" });
      }

      await Estabelecimento.update(
        { logo_url: imageUrl },
        { where: { idestabelecimento: storeId } },
      );

      res.status(200).json({
        message: "Upload de logo do estabelecimento realizado com sucesso!",
        imageUrl,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao salvar logo no banco." });
    }
  },
);

// Rota para upload de múltiplas imagens de produto
router.post(
  "/product-images",
  //authMiddleware,
  upload.array("productImages", 5),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
      }

      const productId = req.body.productId; // o ID do produto deve vir no body
      const imageUrls = files.map(
        (file) => `/uploads/products/${file.filename}`,
      );

      // Cria registros no banco
      const imageRecords = await Promise.all(
        imageUrls.map((url) =>
          ImagemProduto.create({ produtoId: productId, caminho: url }),
        ),
      );

      res.status(200).json({
        message: "Upload de imagens de produto realizado com sucesso!",
        imageUrls,
        imageRecords,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao salvar imagens no banco." });
    }
  },
);

router.post(
  "/receita",
  upload.single("receitaFile"),
  authMiddleware,               
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        console.log("❌ Upload Receita: Nenhum arquivo enviado.");
        return res.status(400).json({ message: "Nenhum arquivo de receita enviado." });
      }

      console.log(`✅ Upload Receita: Arquivo recebido: ${req.file.filename}`);
      
      console.log('🔍 USER OBJECT:', (req as any).user);
      
      const userId = (req as any).user?.id;
      
      if (!userId) {
        console.log("❌ Upload Receita: Usuário não autenticado.");
        return res.status(401).json({ message: "Usuário não autenticado." });
      }

      const pedidoId = req.body.pedidoId;
      if (!pedidoId) {
        console.log("❌ Upload Receita: ID do Pedido ausente.");
        return res.status(400).json({ message: "ID do pedido é necessário para salvar a receita." });
      }

      const imageUrl = `/uploads/receitas/${req.file.filename}`;
      
      const receitaRecord = await ReceitaMedicaService.createReceitaMedica({
          pedido_idpedido: Number(pedidoId), 
          cliente_idcliente: Number(userId),
          caminho_documento: imageUrl,
          nome_arquivo: req.file.originalname,
          status_receita: 'pendente'
      });
      
      res.status(200).json({
        message: "Upload e registro da receita realizados com sucesso!",
        imageUrl,
        receitaId: (receitaRecord as any).idreceita_medica, 
        pedidoId: receitaRecord.pedido_idpedido,
      });
      
    } catch (error) {
      console.error("❌ Erro no processamento do upload de receita:", error);
      res.status(500).json({ 
          message: (error as Error).message || "Erro interno ao processar a receita." 
      });
    }
  },
);

export default router;
