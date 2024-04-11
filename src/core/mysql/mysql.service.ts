import { OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import serverConfig from '../config/server.config';
import { ConnectKeys } from '../define/connect.key';
import { ServerLogger } from '../server-log/server.log.service';

/**
 * Mysql Service
 */

export class MysqlService implements OnModuleDestroy, OnModuleInit {
  _connectionMap = new Map<string, DataSource>();

  async onModuleInit(): Promise<void> {
    const dbs = serverConfig.db.mysql;
    const dev = serverConfig.dev;
    for (const db of dbs) {
      const ucon = new DataSource({
        type: 'mysql',
        host: db.host,
        port: db.port,
        username: db.user_name,
        password: db.password,
        database: db.db_name,
        poolSize: db.poolSize,
        entities: [__dirname + '/../../**/**/*.schema.ts', __dirname + '/../../**/**/*.schema.js'],
        synchronize: dev,
        bigNumberStrings: false,
        timezone: 'Z',
      });
      await ucon.initialize();

      this._connectionMap.set(db.db_name, ucon);
      const host = `${db.host}:${db.port}`;
      ServerLogger.log('mysql', `Connecting to a Mysql instance. host=${host} db=${db.db_name}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    const tasks = [];
    this._connectionMap.forEach((connection) => {
      tasks.push(connection.destroy());
    });
    await Promise.all(tasks);
    ServerLogger.log('Mysql onModuleDestroy');
  }

  getGlobalClient(): DataSource {
    const con = this._connectionMap.get(ConnectKeys.getGlobalKey());
    return con;
  }

  getClient(key: string): DataSource {
    const con = this._connectionMap.get(ConnectKeys.getKey(key));
    return con;
  }
}
