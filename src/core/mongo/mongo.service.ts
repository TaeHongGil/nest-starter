import { type OnModuleDestroy } from '@nestjs/common';
import mongoose, { type Connection } from 'mongoose';
import ServerConfig from '../config/server.config';
import { ConnectKeys } from '../define/connect.key';
import { ServerLogger } from '../server-log/server.log.service';

/**
 * Mongo Service
 */
export class MongoService implements OnModuleDestroy {
  _connectionMap = new Map<string, Connection>();

  async onBeforeModuleInit(): Promise<void> {
    const dbs = ServerConfig.db.mongo;
    for (const db of dbs) {
      if (db.active == false) {
        continue;
      }
      const host = `mongodb://${db.host}:${db.port}`;
      const ucon = mongoose.createConnection(host, {
        dbName: db.db_name,
        user: db.user_name,
        pass: db.password,
        authSource: db.auth_source,
        maxPoolSize: db.max_pool_size,
        minPoolSize: db.min_pool_size,
        tls: db.use_tls,
      });
      this._connectionMap.set(db.db_name, ucon);
      ServerLogger.log('mongo', `Connecting to a MongoDB instance. host=${host} db=${db.db_name}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    const tasks = [];
    this._connectionMap.forEach((connection) => {
      tasks.push(connection.close());
    });
    await Promise.all(tasks);
    ServerLogger.log('Mongo onModuleDestroy');
  }

  getGlobalClient(): Connection {
    const con = this._connectionMap.get(ConnectKeys.getGlobalKey());

    return con;
  }

  getClient(key: string): Connection {
    const con = this._connectionMap.get(ConnectKeys.getKey(key));

    return con;
  }
}
