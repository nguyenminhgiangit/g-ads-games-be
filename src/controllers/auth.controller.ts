import { log } from 'console';
import { AuthService } from '../services/auth.service';
import { AccessTokenPayload } from '../services/token.service';
class AuthController {
    async register(req: any, res: any) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.register(email, password);
            res.json(result);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
    async guest(req: any, res: any) {
        try {
            const { uuid, platform } = req.body;
            if (!uuid) return res.status(400).json({ error: "Device id is required" });
            const ip = req.ip;
            const userAgent = req.get('User-Agent');
            const _platform = platform ?? 'web';
            const result = await AuthService.guest(uuid, _platform, ip, userAgent);
            res.json(result);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
    async login(req: any, res: any) {
        try {
            const { email, password, deviceId, platform } = req.body;
            const ip = req.ip;
            const userAgent = req.get('User-Agent');
            const result = await AuthService.login(email, password, deviceId, platform, ip, userAgent);
            res.json(result);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
    async refreshTokens(req: any, res: any, next: any) {
        try {
            const { refreshToken, uuid, platform } = req.body;
            const ip = req.ip;
            const userAgent = req.get('User-Agent');
            const _platform = platform ?? 'web';
            const result = await AuthService.refreshTokens(refreshToken, uuid, _platform, ip, userAgent);
            res.json(result);
        } catch (err: any) {
            res.status(401).json({ message: err.message });
        }
    }
    async changePassword(req: any, res: any, next: any) {
        try {
            const { currentPassword, newPassword } = req.body;
            const { userId }: AccessTokenPayload = req.user;
            const result = await AuthService.changePassword(userId, currentPassword, newPassword);
            res.json(result);
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
    async logout(req: any, res: any, next: any) {
        try {
            const { userId, deviceId, platform }: AccessTokenPayload = req.user;
            await AuthService.logout(userId, deviceId, platform);
            res.json({ message: "Logged out" });
        } catch (err: any) {
            res.status(400).json({ message: err.message });
        }
    }
    async logoutAll(req: any, res: any) {
        const { userId }: AccessTokenPayload = req.user;
        await AuthService.logoutAllDevices(userId);
        res.json({ message: 'Logged out from all devices' });
    };

    async getActiveSessions(req: any, res: any) {
        const { userId }: AccessTokenPayload = req.user;
        const sessions = await AuthService.listSessions(userId);
        res.json(sessions);
    };
}
export const authController = new AuthController();