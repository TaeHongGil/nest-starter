import { Injectable, OnModuleDestroy } from '@nestjs/common';
import mongoose, { type Connection, ClientSession } from 'mongoose';
import 'reflect-metadata'; // Reflect 메타데이터를 사용하기 위해 추가
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
    const con = this._connectionMap.get(ConnectKeys.getGlobalKey());
    return con;
  }

  static getClient(key: string): Connection {
    const con = this._connectionMap.get(ConnectKeys.getKey(key));

    return con;
  }

  async onBeforeModuleInit(): Promise<void> {
    const dbs = ServerConfig.db.mongo;
    for (const db of dbs) {
      if (db.active == false) {
        continue;
      }
      const host = `mongodb://${db.hosts.join(',')}/?replicaSet=${db.replica_set}`;
      const ucon = mongoose.createConnection(host, {
        dbName: db.db_name,
        user: db.user_name,
        pass: db.password,
        authSource: db.auth_source,
        maxPoolSize: db.max_pool_size,
        minPoolSize: db.min_pool_size,
        tls: db.use_tls,
        autoIndex: true,
      });
      MongoService._connectionMap.set(db.db_name, ucon); // 정적 필드 사용
      ServerLogger.log('mongo', `Connecting to a MongoDB instance. host=${host} db=${db.db_name}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    const tasks = [];
    MongoService._connectionMap.forEach((connection) => {
      // 정적 필드 사용
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
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
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
        session.endSession();
        MongoService.setCurrentSession(undefined);
      }
    };

    Object.defineProperty(descriptor.value, 'name', { value: originalMethod.name });

    return descriptor;
  };
}
