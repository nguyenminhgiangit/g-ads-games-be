import { credentials } from '@grpc/grpc-js';
import { AuthServiceClient } from '../generated/auth';

const authServiceClient = new AuthServiceClient(
    process.env.AUTH_GRPC_URL || 'localhost:50051',
    credentials.createInsecure()
);

export default authServiceClient;
