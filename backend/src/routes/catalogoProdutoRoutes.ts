import { Router } from "express";
import CatalogoProdutoController from "../controllers/CatalogoProdutoController";

const router = Router();

router.post("/", CatalogoProdutoController.addProdutoToCatalog);
router.get("/:idcatalogo_produto", CatalogoProdutoController.getById);
router.get(
  "/estabelecimento/:idestabelecimento",
  CatalogoProdutoController.getByEstabelecimento
);
router.patch("/:idcatalogo_produto", CatalogoProdutoController.update);
router.delete("/:idcatalogo_produto", CatalogoProdutoController.remove);

export default router;
