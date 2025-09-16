import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdminRole } from "../middlewares/admin.middleware";
const gameConfigRouters = Router();

gameConfigRouters.get('/meta', authMiddleware, requireAdminRole);
// adminRouters.patch('/user/:id', authMiddleware, requireAdminRole, adminController.updateUser);

// gameRouters.post('/spin', authMiddleware, gameController.spin);
// gameRouters.post('/reset', authMiddleware, gameController.reset);
// gameRouters.post('/submit-info', authMiddleware, gameController.submitInfo);
// gameRouters.post('/claim',authMiddleware,  wheelController.spin);

// gameRouters.get('/history', authMiddleware, wheelController.spin);

export { gameConfigRouters }