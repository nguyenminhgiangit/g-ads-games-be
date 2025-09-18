import mongoose, { Connection } from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

export enum ConnectionKey {
    Auth = 'auth',
    User = 'user',
    Game = 'game'
}

type ConnectionConfig = {
    key: ConnectionKey;
    uri: string;
};

type ConnMap = {
    [key: string]: Connection;
};

const connections: ConnMap = {};

function connectionConfigList(): ConnectionConfig[] {
    return [
        {
            key: ConnectionKey.Auth,
            uri: process.env.MONGO_AUTH_URI!,
        },
        {
            key: ConnectionKey.User,
            uri: process.env.MONGO_USER_URI!,
        },
        {
            key: ConnectionKey.Game,
            uri: process.env.MONGO_GAME_URI!,
        }
    ];
}

/**
 * init all connection MongoDB by Mongoose.
 */
export async function connectDatabases(callback: (connMap: ConnMap) => void): Promise<void> {
    const configList = connectionConfigList();
    if (configList.length > 0) {
        console.log(`✅ Mongoose connected:`);
    }

    const connectionPromises = configList.map(async ({ key, uri }) => {
        const conn = await mongoose.createConnection(uri).asPromise();
        connections[key] = conn;
        console.log(`   🔌🤝 ${conn.name}`);
    });

    try {
        await Promise.all(connectionPromises);
        callback(connections);
    } catch (err) {
        console.error('❌ Failed to connect Mongoose:', err);
        process.exit(1);
    }
}
2
function getConn(key: ConnectionKey): Connection {
    const conn = connections[key];
    if (!conn) throw new Error(`Connection "${key}" not found.`);
    return conn;
}

export function getAuthConn(): Connection {
    return getConn(ConnectionKey.Auth);
}

export function getUserConn(): Connection {
    return getConn(ConnectionKey.User);
}

export function getGameConn(): Connection {
    return getConn(ConnectionKey.Game);
}

export function getGameConfigConn(): Connection {
    return getConn(ConnectionKey.Game);
}


