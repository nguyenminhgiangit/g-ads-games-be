import { Router } from "express";
import { gameController } from "../controllers/game.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const gameRouters = Router();


gameRouters.get('/me', authMiddleware, gameController.gameMe);
gameRouters.post('/spin', authMiddleware, gameController.spin);
gameRouters.post('/reset', authMiddleware, gameController.reset);
gameRouters.post('/submit-info', authMiddleware, gameController.submitInfo);
// gameRouters.post('/claim',authMiddleware,  wheelController.spin);

gameRouters.get('/activities', authMiddleware, gameController.getActivities);

export { gameRouters }