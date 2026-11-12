import { Router } from "express";
import * as controller from "../controllers/pasteController.js";
import { createLimiter, readLimiter, unlockLimiter } from "../middleware/rateLimiter.js";
import { validateCreate, validateId, validateUnlock } from "../middleware/validate.js";

const router = Router();

router.get("/health", controller.health);

router.post("/api/pastes", createLimiter, validateCreate, controller.create);
router.get("/api/pastes/:id", readLimiter, validateId, controller.getOne);
router.post("/api/pastes/:id/unlock", unlockLimiter, validateId, validateUnlock, controller.unlock);

router.get("/raw/:id", readLimiter, validateId, controller.raw);

export default router;
