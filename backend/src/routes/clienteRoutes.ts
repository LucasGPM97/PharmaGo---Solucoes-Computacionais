import { Router } from "express";
import ClienteController from "../controllers/ClienteController";

const router = Router();

router.post("/", ClienteController.create);
router.get("/:idcliente", ClienteController.findById);
router.get("/", ClienteController.findAll);
router.put("/:idcliente", ClienteController.update);
router.delete("/:idcliente", ClienteController.delete);

export default router;
