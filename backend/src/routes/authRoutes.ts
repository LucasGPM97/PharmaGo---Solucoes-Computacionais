import { Router } from "express";
import AuthController from "../controllers/AuthController";

const router = Router();

router.post("/registerCliente", AuthController.registerCliente);
router.post("/loginCliente", AuthController.loginCliente);
router.post("/registerEstabelecimento", AuthController.registerEstabelecimento);
router.post("/loginEstabelecimento", AuthController.loginEstabelecimento);

export default router;
