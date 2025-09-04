import { Router } from "express";
import { spinController } from "../controllers/spin.controller";
const spinRouter = Router();

const prefix = "/api/spin";

spinRouter.post(`${prefix}`, spinController.spin);
export { spinRouter }