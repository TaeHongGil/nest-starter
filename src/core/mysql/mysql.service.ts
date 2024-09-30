import { type OnModuleDestroy } from '@nestjs/common';
import mysql from 'mysql2/promise';
import { DataSource } from 'typeorm';
import ServerConfig from '../config/server.config';
import { ConnectKeys } from '../define/connect.key';
import { ServerLogger } from '../server-log/server.log.service';

/**
 * Mysql Service
 */
export class MysqlService implements OnModuleDestroy {
  _connectionMap = new Map<string, DataSource>();

  async onBeforeModuleInit(): Promise<void> {
    const dbs = ServerConfig.db.mysql;
    const dev = ServerConfig.dev;
    for (const db of dbs) {
      if (db.active == false) {
        continue;
      }
      await this.createDatabaseIfNotExists(db.host, db.port, db.user_name, db.password, db.db_name);

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

  async createDatabaseIfNotExists(host: string, port: number, username: string, password: string, database: string): Promise<void> {
    const connection = await mysql.createConnection({
      host,
      port,
      user: username,
      password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
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
