import { Router } from "express";
import FormaPagamentoController from "../controllers/FormaPagamentoController";

const router = Router();

router.get("/", FormaPagamentoController.findAll);
router.get("/:id", FormaPagamentoController.findById);

export default router;
