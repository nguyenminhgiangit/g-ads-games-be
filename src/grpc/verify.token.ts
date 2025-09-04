import { VerifyTokenResponse } from '../generated/auth';
import authServiceClient from './client.grpc';

export const verifyTokenByGRPC = (token: string): Promise<VerifyTokenResponse> => {
    return new Promise((resolve, reject) => {
        authServiceClient.verifyToken({ token }, (err: any, res: any) => {
            if (err || !res) {
                return reject(new Error('Invalid token'));
            }
            resolve(res);
        });
    });
};
