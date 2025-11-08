import { Router } from "express";
import PedidoController from "../controllers/PedidoController";

const router = Router();

router.post("/", PedidoController.create);

router.get("/cliente/:cliente_idcliente", PedidoController.findByCliente);
router.get(
  "/estabelecimento/:estabelecimento_idestabelecimento",
  PedidoController.findByEstabelecimento
);
router.get("/:idpedido", PedidoController.findById);
router.put("/:idpedido", PedidoController.update);
router.delete("/:idpedido", PedidoController.delete);

export default router;
