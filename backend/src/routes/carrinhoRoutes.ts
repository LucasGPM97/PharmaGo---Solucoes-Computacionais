import { Router } from "express";
import CarrinhoController from "../controllers/CarrinhoController";

const router = Router();

router.get("/:idcliente", CarrinhoController.getCarrinho);
router.post("/:idcarrinho/item", CarrinhoController.addItem);
router.put(
  "/:idcarrinho/item/:idproduto",
  CarrinhoController.updateItemQuantity
);
router.delete("/:idcarrinho/item/:idproduto", CarrinhoController.removeItem);
router.delete("/:idcarrinho", CarrinhoController.clearCarrinho);

export default router;
