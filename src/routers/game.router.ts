import { Router } from "express";
import { wheelController } from "../controllers/wheel.controller";
import { gameController } from "../controllers/game.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const gameRouters = Router();

gameRouters.post('/spin', authMiddleware, gameController.spin);
gameRouters.post('/reset', authMiddleware, gameController.reset);
gameRouters.post('/submit-info', authMiddleware, gameController.submitInfo);
// gameRouters.post('/claim',authMiddleware,  wheelController.spin);

gameRouters.get('/history', authMiddleware, wheelController.spin);

export { gameRouters }