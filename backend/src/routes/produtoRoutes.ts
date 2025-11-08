import { Router } from "express";
import ProdutoController from "../controllers/ProdutoController";

const router = Router();

router.get("/por-classe", ProdutoController.findByClasse);
router.post("/", ProdutoController.create);
// NOVA ROTA para buscar as classes terapêuticas distintas
router.get("/classes-terapeuticas", ProdutoController.findDistinctClasses);
router.get("/:idproduto", ProdutoController.findById);
router.get("/", ProdutoController.findAll); // Rota para buscar todos os produtos genéricos
router.put("/:idproduto", ProdutoController.update);
router.delete("/:idproduto", ProdutoController.delete);

export default router;
