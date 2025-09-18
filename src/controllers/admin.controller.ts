import { AdminService } from "../services/admin.service";

class AdminController {
    async updateUser(req: any, res: any) {
        try {
            const userId = req.params.id;
            const { displayName, gender, isBanned, birthday } = req.body;
            const result = await AdminService.updateUser(
                userId,
                displayName,
                gender,
                birthday,
                isBanned
            );
            res.json(result);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
    async getConfig(req: any, res: any) {
        try {
            const config = await AdminService.getGameConfig();
            res.json(config);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
    async updateConfig(req: any, res: any) {
        try {
            const { payload } = req.body;
            const updated = await AdminService.updateGameConfig(JSON.parse(payload));
            res.json(updated);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
}
export const adminController = new AdminController();