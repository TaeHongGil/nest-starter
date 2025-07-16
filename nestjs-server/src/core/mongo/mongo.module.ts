import { Global, Module, type OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ServerConfig from '@root/core/config/server.config';
import { DBConnectKeys } from '@root/core/define/db.connect.key';
import { MongoService } from '@root/core/mongo/mongo.service';
import { Connection } from 'mongoose';
import ServerLogger from '../server-logger/server.logger';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [MongoService],
      useFactory: async (mongoService: MongoService) => {
        const db = ServerConfig.db.mongo;
        if (!db.active) return;
        const dbName = DBConnectKeys.getKey(db.db_name);
        const uri = `mongodb://${db.hosts.join(',')}/?replicaSet=${db.replica_set}`;

        return {
          uri,
          dbName,
          user: db.user_name,
          pass: db.password,
          authSource: db.auth_source,
          maxPoolSize: db.max_pool_size,
          minPoolSize: db.min_pool_size,
          tls: db.use_tls,
          onConnectionCreate: (connection: Connection): Connection => mongoService.onConnectionCreate(dbName, db, connection),
        };
      },
      inject: [MongoService],
    }),
  ],
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('MongoModule.onModuleInit');
  }
}
