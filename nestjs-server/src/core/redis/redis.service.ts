import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientOptions, RedisClientType, createClient } from 'redis';
import { ServerConfig } from '../config/server.config';
import { DBConnectKeys } from '../define/db.connect.key';
import { ServerLogger } from '../server-log/server.logger';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;

  async onBeforeModuleInit(): Promise<void> {
    const db = ServerConfig.db.redis;
    if (!db.active) {
      return;
    }

    const dbName = DBConnectKeys.getKey(db.db_name);
    const socketOptions: any = {
      host: db.host,
      port: db.port,
      checkServerIdentity: (): any => undefined,
      reconnectStrategy: (_retries: number): number | Error => {
        ServerLogger.warn(`[redis.${dbName}] Reconnecting...`);

        return 3000;
      },
    };
    if (db.tls) {
      socketOptions.tls = true;
    }
    const redisClientOptions: RedisClientOptions = {
      username: db.user_name,
      password: db.password,
      database: db.db,
      socket: socketOptions,
    };

    const redisClient = createClient(redisClientOptions) as RedisClientType;
    this.client = redisClient;
    await redisClient.connect();

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

  async onModuleDestroy(): Promise<void> {
    this.client.destroy();
    ServerLogger.log('RedisService: All connections closed.');
  }

  getGlobalClient(): RedisClientType {
    const connection = this.client;
    if (!connection) {
      throw new Error(`Redis connection not found`);
    }

    return connection;
  }
}
