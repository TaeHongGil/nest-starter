import { OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
import ServerConfig from '../config/server.config';
import { ConnectKeys } from '../define/connect.key';
import { ServerLogger } from '../server-log/server.log.service';

/**
 * Redis Service
 */

export class RedisService implements OnModuleDestroy, OnModuleInit {
  _connectionMap = new Map<string, RedisClientType>();

  async onModuleInit(): Promise<void> {
    const dbs = ServerConfig.db.redis;
    for (const db of dbs) {
      if (db.active == false) {
        continue;
      }
      const protocol = db.tls === true ? 'rediss' : 'redis';
      const redisClientOptions = {
        url: `${protocol}://${db.host}:${db.port}`,
        username: db.user_name,
        password: db.password,
        database: db.db,
        socket: undefined,
      };
      if (db.tls) {
        redisClientOptions.socket = { tls: true, checkServerIdentity: () => undefined };
      }

      const redisClient: RedisClientType = createClient(redisClientOptions);
      try {
        await redisClient.connect();
        ServerLogger.log(`[redis.${db.db_name}] ${db.host}:${db.port}/${db.db} connected`);
      } catch (err) {
        ServerLogger.error(`[redis.${db.db_name}] ${db.host}:${db.port}/${db.db} failed to connect. message=${err.message}`);
      }
      redisClient.on('error', (err) => {
        ServerLogger.error(`[redis.${db.db_name}] error: ${err.message}`);
      });

      this._connectionMap.set(db.db_name, redisClient);
    }
  }

  async onModuleDestroy(): Promise<void> {
    const tasks = [];
    this._connectionMap.forEach((connection) => {
      tasks.push(connection.disconnect());
    });
    await Promise.all(tasks);
    ServerLogger.log('Redis onModuleDestroy');
  }

  getGlobalClient(): RedisClientType {
    const con = this._connectionMap.get(ConnectKeys.getGlobalKey());
    return con;
  }

  getClient(key: string): RedisClientType {
    const con = this._connectionMap.get(ConnectKeys.getKey(key));
    return con;
  }
}
