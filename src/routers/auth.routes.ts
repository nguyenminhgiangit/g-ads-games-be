import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const authRouters = Router();

authRouters.post('/register', authController.register);
authRouters.post('/guest', authController.guest);
authRouters.post('/login', authController.login);
authRouters.post('/change-password', authMiddleware, authController.changePassword);
authRouters.post('/refresh-token', authController.refreshTokens);
authRouters.get('/sessions', authMiddleware, authController.getActiveSessions);
authRouters.post('/logout', authMiddleware, authController.logout);
authRouters.post('/logout-all', authMiddleware, authController.logoutAll);


export { authRouters }