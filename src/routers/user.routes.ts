import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRouters = Router();

userRouters.get('/me', authMiddleware, userController.getProfile);
userRouters.patch('/me', authMiddleware, userController.updateProfile);
// userRouters.get('/game-me', authMiddleware, userController.gameForMe);

// Đặt CUỐI CÙNG
userRouters.get('/:id', authMiddleware, userController.getPublicProfile);

export { userRouters }