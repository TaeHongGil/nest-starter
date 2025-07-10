import { Injectable, OnModuleDestroy } from '@nestjs/common';
import ServerConfig, { RedisConfig } from '@root/core/config/server.config';
import { DBConnectKeys } from '@root/core/define/db.connect.key';
import ServerLogger from '@root/core/server-logger/server.logger';
import { RedisClientOptions, RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;
  private subscriber: RedisClientType;
  private publisher: RedisClientType;

  private setRedisEventHandlers(redisClient: RedisClientType, dbName: string, db: RedisConfig, isPubSub = false): void {
    redisClient.on('ready', () => {
      ServerLogger.log(`[redis.${dbName}] ${db.host}:${db.port}/${db.db} connected${isPubSub ? ' (pub/sub)' : ''}`);
    });
    redisClient.on('error', (err) => {
      if (!isPubSub) {
        if (err.message === 'Socket closed unexpectedly') {
          ServerLogger.error(`[redis.${dbName}] ${db.host}:${db.port}/${db.db} Connection closed unexpectedly. Retrying...`, err.stack);
        } else {
          ServerLogger.error(`[redis.${dbName}] ${db.host}:${db.port}/${db.db} error: ${err.code}`, err.stack);
        }
      }
    });
    redisClient.on('end', () => {
      ServerLogger.warn(`[redis.${dbName}] ${db.host}:${db.port}/${db.db} Connection closed.${isPubSub ? ' (pub/sub)' : ''}`);
    });
  }

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
    this.publisher = redisClient.duplicate();
    this.subscriber = redisClient.duplicate();

    this.setRedisEventHandlers(this.client, dbName, db);
    this.setRedisEventHandlers(this.publisher, dbName, db, true);
    this.setRedisEventHandlers(this.subscriber, dbName, db, true);
    await this.client.connect();
    await this.publisher.connect();
    await this.subscriber.connect();
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
