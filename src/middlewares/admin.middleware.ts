import { AccessTokenPayload, verifyAccessToken } from "../services/token.service";

export const requireAdminRole = (req: any, res: any, next: any) => {
    const user = req.user as AccessTokenPayload;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
}
