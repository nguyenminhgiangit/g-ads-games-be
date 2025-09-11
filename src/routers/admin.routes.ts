import { Router } from "express";
import { requireAdminRole } from "../middlewares/admin.middleware";
import { adminController } from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const adminRouters = Router();

adminRouters.patch('/user/:id', authMiddleware, requireAdminRole, adminController.updateUser);

export { adminRouters }