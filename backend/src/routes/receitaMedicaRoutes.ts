import { Router } from "express";
import ReceitaMedicaController from "../controllers/ReceitaMedicaController";

const router = Router();

router.post("/", ReceitaMedicaController.create);
router.get("/:id", ReceitaMedicaController.findById);
router.get("/pedido/:pedido_id", ReceitaMedicaController.findByPedidoId);
router.put("/:id", ReceitaMedicaController.update);
router.delete("/:id", ReceitaMedicaController.delete);

export default router;
