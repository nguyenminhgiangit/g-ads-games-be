import { Router } from "express";
import { requireAdminRole } from "../middlewares/admin.middleware";
import { adminController } from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const adminRouters = Router();

// adminRouters.patch('/user/:id', authMiddleware, requireAdminRole, adminController.updateUser);
adminRouters.get('/config', authMiddleware, requireAdminRole, adminController.getConfig);
adminRouters.patch('/config', authMiddleware, requireAdminRole, adminController.updateConfig);

export { adminRouters }