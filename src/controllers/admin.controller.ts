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
}
export const adminController = new AdminController();