import { Router } from "express";
import EnderecoEstabelecimentoController from "../controllers/EnderecoEstabelecimentoController";

const router = Router();

router.post("/", EnderecoEstabelecimentoController.create);
router.get(
  "/:idendereco_estabelecimento",
  EnderecoEstabelecimentoController.findById
);
router.get(
  "/estabelecimento/:idestabelecimento",
  EnderecoEstabelecimentoController.findByEstabelecimento
);
router.put(
  "/:idendereco_estabelecimento",
  EnderecoEstabelecimentoController.update
);
router.delete(
  "/:idendereco_estabelecimento",
  EnderecoEstabelecimentoController.delete
);

export default router;
