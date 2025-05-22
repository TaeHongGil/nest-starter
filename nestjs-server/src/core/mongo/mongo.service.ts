import { Injectable, OnModuleDestroy } from '@nestjs/common';
import mongoose, { type Connection, ClientSession } from 'mongoose';
import ServerConfig from '../config/server.config';
import { DBConnectKeys } from '../define/db.connect.key';
import { ServerLogger } from '../server-log/server.log.service';

/**
 * Mongo Service
 */
@Injectable()
export class MongoService implements OnModuleDestroy {
  private connection: Connection;
  private session: ClientSession;

  async onBeforeModuleInit(): Promise<void> {
    const db = ServerConfig.db.mongo;
    if (!db.active) {
      return;
    }
    const dbName = DBConnectKeys.getKey(db.db_name);
    const host = `mongodb://${db.hosts.join(',')}/?replicaSet=${db.replica_set}`;
    const connection = mongoose.createConnection(host, {
      dbName: dbName,
      user: db.user_name,
      pass: db.password,
      authSource: db.auth_source,
      maxPoolSize: db.max_pool_size,
      minPoolSize: db.min_pool_size,
      tls: db.use_tls,
      autoIndex: true,
    });
    this.connection = connection;

    connection.on('connected', () => {
      ServerLogger.log(`[mongo.${dbName}] Connected to MongoDB.`);
    });

    connection.on('disconnected', async () => {
      ServerLogger.warn(`[mongo.${dbName}] Disconnected from MongoDB. Attempting to reconnect...`);
      await this.reconnect(connection, host, dbName);
    });

    connection.on('error', (err) => {
      ServerLogger.error(`[mongo.${dbName}] MongoDB connection error: ${err.message}`);
    });
  }

  /**
   * MongoDB 재연결 로직
   */
  private async reconnect(connection: Connection, host: string, dbName: string): Promise<void> {
    try {
      const dbConfig = ServerConfig.db.mongo;
      await connection.openUri(host, {
        dbName: dbName,
        user: dbConfig.user_name,
        pass: dbConfig.password,
        authSource: dbConfig.auth_source,
        maxPoolSize: dbConfig.max_pool_size,
        minPoolSize: dbConfig.min_pool_size,
        tls: dbConfig.use_tls,
        autoIndex: true,
      });
      ServerLogger.log(`[mongo.${dbName}] Reconnected to MongoDB.`);
    } catch (err) {
      ServerLogger.warn(`[mongo.${dbName}] Reconnection  failed: ${err.message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.connection.close();
    ServerLogger.log('Mongo onModuleDestroy');
  }

  getGlobalClient(): Connection {
    return this.connection;
  }
}
