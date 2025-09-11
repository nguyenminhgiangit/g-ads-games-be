import { getSessionModel } from "../models/session.model";
import { AccessTokenPayload, verifyAccessToken } from "../services/token.service";

export const authMiddleware = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const user: AccessTokenPayload = verifyAccessToken(token);
        const { sessionId } = user;
        const Session = getSessionModel();
        const session = await Session.findById(sessionId);
        if (!session) return res.status(401).json({ error: 'Session expired' });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
