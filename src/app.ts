import dotenv from 'dotenv';
import express from "express";
import cors from 'cors';
import { connectDatabases } from './databases/mongodb.database';
import { initRedis } from './configs/redis.config';
import { authRouters } from './routers/auth.routes';
import { userRouters } from './routers/user.routes';
import { gameRouters } from './routers/game.router';
dotenv.config();

async function start() {
    console.log(`\nads-games-service...`);
    initApp();
}
async function initApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(
        express.urlencoded({
            extended: true,
        })
    );

    //routers
    app.use("/api/auth", authRouters);
    app.use("/api/users", userRouters);
    app.use("/api/game", gameRouters);

    //connect db & run app
    connectDatabases(async (connMap) => {
        await initRedis(); // Đảm bảo Redis khởi tạo xong

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`🚀 Server is running on port: ${port}`);
        });
    });
}

start();