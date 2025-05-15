import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientOptions, RedisClientType, createClient } from 'redis';
import { ServerConfig } from '../config/server.config';
import { ConnectKeys } from '../define/connect.key';
import { ServerLogger } from '../server-log/server.log.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly connectionMap = new Map<string, RedisClientType>();

  async onBeforeModuleInit(): Promise<void> {
    const dbs = ServerConfig.db.redis;

    for (const db of dbs) {
      if (!db.active) {
        continue;
      }

      const dbName = ConnectKeys.getKey(db.db_name);
      const redisClientOptions: RedisClientOptions = {
        username: db.user_name,
        password: db.password,
        database: db.db,
        socket: {
          host: db.host,
          port: db.port,
          tls: db.tls,
          checkServerIdentity: (): any => undefined,
          reconnectStrategy: (_retries: number): number | Error => {
            ServerLogger.warn(`[redis.${dbName}] Reconnecting...`);

            return 3000;
          },
        },
      };

      const redisClient = createClient(redisClientOptions) as RedisClientType;
      await redisClient.connect();

      this.connectionMap.set(dbName, redisClient);
      redisClient.on('connect', () => {
        ServerLogger.log(`[redis.${dbName}] ${db.host}:${db.port}/${db.db} connected`);
      });

      redisClient.on('error', (err) => {
        ServerLogger.error(`[redis.${dbName}] ${db.host}:${db.port}/${db.db} failed to connect. message=${err.code}`);
      });

      redisClient.on('end', () => {
        ServerLogger.warn(`[redis.${dbName}] Connection closed.`);
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    const tasks = [];
    this.connectionMap.forEach((connection) => {
      tasks.push(connection.disconnect());
    });
    await Promise.all(tasks);
    ServerLogger.log('RedisService: All connections closed.');
  }

  getGlobalClient(): RedisClientType {
    const globalKey = ConnectKeys.getKey('global');
    const connection = this.connectionMap.get(globalKey);
    if (!connection) {
      throw new Error(`Redis connection not found for global key: ${globalKey}`);
    }

    return connection;
  }

  getClient(key: string): RedisClientType {
    const connectionKey = ConnectKeys.getKey(key);
    const connection = this.connectionMap.get(connectionKey);
    if (!connection) {
      throw new Error(`Redis connection not found for key: ${connectionKey}`);
    }

    return connection;
  }
}
