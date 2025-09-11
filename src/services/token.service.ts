import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export function generateAccessToken(userId: string, sessionId: string, deviceId: string, platform: string, role: string) {
    return jwt.sign({ userId, sessionId, deviceId, platform, role }, JWT_SECRET, { expiresIn: '15m' });
}

export interface AccessTokenPayload {
    userId: string;
    sessionId: string;
    deviceId: string;
    platform: string;
    role: string;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
        return payload;
    } catch (err) {
        throw new Error('Invalid or expired token');
    }
}