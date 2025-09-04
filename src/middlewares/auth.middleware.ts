import axios from 'axios';
import { AccessTokenPayload } from '../utils/jwt';
import { verifyTokenByGRPC } from '../grpc/verify.token';;

export const authMiddleware = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const AUTH_URL = process.env.AUTH_REST_URL;
        const { data } = await axios.post(`${AUTH_URL}/auth/verify-token`, { token });
        req.user = data as AccessTokenPayload; // gán thông tin user từ Auth Service
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const authMiddlewareByGRPC = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const data = await verifyTokenByGRPC(token) as AccessTokenPayload;
        console.log('grpc data: ', data);
        req.user = data; // gán thông tin user từ Auth Service
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
