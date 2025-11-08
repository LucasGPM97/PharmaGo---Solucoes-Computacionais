import { Router } from "express";
import EstabelecimentoController from "../controllers/EstabelecimentoController";

const router = Router();

router.post("/", EstabelecimentoController.create);
router.get("/:idestabelecimento", EstabelecimentoController.findById);
router.get("/", EstabelecimentoController.findAll);
router.put("/:idestabelecimento", EstabelecimentoController.update);
router.delete("/:idestabelecimento", EstabelecimentoController.delete);

export default router;
