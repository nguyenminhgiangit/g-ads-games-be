import dotenv from 'dotenv';
import express from "express";
import cors from 'cors';
import { spinRouter } from './routers/spin.router';
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
    app.use(spinRouter);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Server is running on port: ${port}`);
    });
}

start();