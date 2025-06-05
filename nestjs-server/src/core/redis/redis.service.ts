import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientOptions, RedisClientType, createClient } from 'redis';
import ServerConfig from '../config/server.config';
import { DBConnectKeys } from '../define/db.connect.key';
import ServerLogger from '../server-logger/server.logger';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;
  private subscriber: RedisClientType;
  private publisher: RedisClientType;

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

    this.publisher = redisClient.duplicate();
    await this.publisher.connect();
    this.subscriber = redisClient.duplicate();
    await this.subscriber.connect();

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
    this.subscriber.destroy();
    this.publisher.destroy();
    ServerLogger.log('RedisService: All connections closed.');
  }

  getGlobalClient(): RedisClientType {
    if (!this.client) {
      throw new Error(`Redis connection not found`);
    }

    return this.client;
  }

  getPublisher(): RedisClientType {
    if (!this.publisher) {
      throw new Error('Redis publisher not initialized');
    }
    return this.publisher;
  }

  getSubscriber(): RedisClientType {
    if (!this.subscriber) {
      throw new Error('Redis subscriber not initialized');
    }
    return this.subscriber;
  }

  async publish(channel: string, message: string): Promise<void> {
    if (!this.client) {
      throw new Error(`Redis connection not found`);
    }
    if (!this.publisher) {
      this.publisher = this.client.duplicate();
      await this.publisher.connect();
    }
    await this.publisher.publish(channel, message);
  }

  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    if (!this.client) {
      throw new Error(`Redis connection not found`);
    }
    if (!this.subscriber) {
      this.subscriber = this.client.duplicate();
      await this.subscriber.connect();
    }
    await this.subscriber.subscribe(channel, (message: string) => {
      handler(message);
    });
  }
}
