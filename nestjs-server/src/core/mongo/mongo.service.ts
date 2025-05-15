import { Injectable, OnModuleDestroy } from '@nestjs/common';
import mongoose, { type Connection, ClientSession } from 'mongoose';
import ServerConfig from '../config/server.config';
import { ConnectKeys } from '../define/connect.key';
import ServerError from '../error/server.error';
import { ServerLogger } from '../server-log/server.log.service';

/**
 * Mongo Service
 */
@Injectable()
export class MongoService implements OnModuleDestroy {
  private static _connectionMap = new Map<string, Connection>();
  private static _currentSession: ClientSession | undefined = undefined;

  static setCurrentSession(session: ClientSession | undefined): void {
    this._currentSession = session;
  }

  static getCurrentSession(): ClientSession | undefined {
    return this._currentSession;
  }

  static getGlobalClient(): Connection {
    const con = this._connectionMap.get(ConnectKeys.getKey('global'));

    return con;
  }

  static getClient(key: string): Connection {
    const con = this._connectionMap.get(ConnectKeys.getKey(key));

    return con;
  }

  async onBeforeModuleInit(): Promise<void> {
    const dbs = ServerConfig.db.mongo;
    for (const db of dbs) {
      const dbName = ConnectKeys.getKey(db.db_name);
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
      MongoService._connectionMap.set(dbName, connection);

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
  }

  /**
   * MongoDB 재연결 로직
   */
  private async reconnect(connection: Connection, host: string, dbName: string): Promise<void> {
    try {
      const dbConfig = ServerConfig.db.mongo.find((db) => db.db_name === dbName);
      if (!dbConfig) {
        throw new Error(`Database configuration not found for ${dbName}`);
      }
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
    const tasks = [];
    MongoService._connectionMap.forEach((connection) => {
      tasks.push(connection.close());
    });
    await Promise.all(tasks);
    ServerLogger.log('Mongo onModuleDestroy');
  }
}

/**
 * MongoDB 트랜잭션 데코레이터
 */
export function MongoTransaction() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<any> {
      const connection = MongoService.getGlobalClient();
      if (!connection) {
        throw ServerError.MONGO_CONNECTION_NOT_FOUND;
      }

      const session: ClientSession = await connection.startSession();
      MongoService.setCurrentSession(session);
      session.startTransaction();

      try {
        const result = await originalMethod.apply(this, args);
        await session.commitTransaction();

        return result;
      } catch (e) {
        await session.abortTransaction();
        ServerLogger.error('Mongo transaction error', e);
        throw ServerError.MONGO_COMMIT_FAILED;
      } finally {
        await session.endSession();
        MongoService.setCurrentSession(undefined);
      }
    };

    Object.defineProperty(descriptor.value, 'name', { value: originalMethod.name });

    return descriptor;
  };
}
