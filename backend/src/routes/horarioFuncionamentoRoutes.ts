import { Router } from "express";
import HorarioFuncionamentoController from "../controllers/HorarioFuncionamentoController";

const router = Router();

router.get(
  "/estabelecimentos/:idestabelecimento/horarios",
  HorarioFuncionamentoController.findAllByEstabelecimento
);
router.patch(
  "/estabelecimentos/:idestabelecimento/horarios",
  HorarioFuncionamentoController.updateBulkByEstabelecimento
);
router.post("/", HorarioFuncionamentoController.create);
router.put("/:idhorario", HorarioFuncionamentoController.update);
router.delete("/:idhorario", HorarioFuncionamentoController.delete);

export default router;
