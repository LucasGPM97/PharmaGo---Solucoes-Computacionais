import { Router } from "express";
import HorarioFuncionamentoController from "../controllers/HorarioFuncionamentoController";

const router = Router();

// === Rotas de Consulta (Aninhadas) ===
// GET /api/estabelecimentos/:idestabelecimento/horarios
// Busca todos os horários de um estabelecimento específico
router.get(
  "/estabelecimentos/:idestabelecimento/horarios",
  HorarioFuncionamentoController.findAllByEstabelecimento
);

router.patch(
  "/estabelecimentos/:idestabelecimento/horarios",
  HorarioFuncionamentoController.updateBulkByEstabelecimento // Usaremos este método
);

// === Rotas de Gerenciamento (CRUD por ID do Horário) ===
// POST /api/horarios
// Cria um novo horário (necessário para dias com turnos duplos, por exemplo)
router.post("/", HorarioFuncionamentoController.create);

// PUT /api/horarios/:idhorario
// Atualiza um horário específico
router.put("/:idhorario", HorarioFuncionamentoController.update);

// DELETE /api/horarios/:idhorario
// Deleta um horário específico
router.delete("/:idhorario", HorarioFuncionamentoController.delete);

export default router;
