import dotenv from 'dotenv';
import express from "express";
import cors from 'cors';
import { connectDatabases } from './databases/mongodb.database';
import { initRedis } from './configs/redis.config';
import { authRouters } from './routers/auth.routes';
import { userRouters } from './routers/user.routes';
import { gameRouters } from './routers/game.router';
import { onDBInit } from './services/database.service';
import { adminRouters } from './routers/admin.routes';
dotenv.config();

async function start() {
    console.log(`\nads-games-service...`);
    initApp();
}
async function initApp() {
    const app = express();

    app.use(cors());
    // app.use(cors({
    //     origin: ["http://localhost:7456", "http://127.0.0.1:8080"], // whitelist
    //     credentials: true,
    //     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    //     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    //     maxAge: 86400,
    // }));


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
    app.use("/api/admin", adminRouters);

    //connect db & run app
    connectDatabases(async (connMap) => {
        await onDBInit();
        await initRedis(); // Đảm bảo Redis khởi tạo xong

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`🚀 Server is running on port: ${port}`);
        });
    });
}

start();