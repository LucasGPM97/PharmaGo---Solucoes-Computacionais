import { Router } from "express";
import EnderecoClienteController from "../controllers/EnderecoClienteController";

const router = Router();

router.post("/", EnderecoClienteController.create);
router.get("/:id", EnderecoClienteController.findById);
router.get("/cliente/:idcliente", EnderecoClienteController.findByCliente);
router.put("/:id", EnderecoClienteController.update);
router.delete("/:id", EnderecoClienteController.delete);

export default router;
