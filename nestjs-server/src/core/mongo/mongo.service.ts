import { type Connection } from 'mongoose';
import { MongoConfig } from '../config/server.config';
import ServerLogger from '../server-logger/server.logger';

/**
 * Mongo Service
 */
export class MongoService {
  onConnectionCreate(uri: string, config: MongoConfig, connection: Connection): Connection {
    connection.on('connected', () => {
      ServerLogger.log(`[mongo.${config.db_name}] Connected to MongoDB.`);
    });

    connection.on('disconnected', () => {
      ServerLogger.warn(`[mongo.${config.db_name}] Disconnected from MongoDB. Waiting for auto-reconnect...`);
    });

    connection.on('error', (err) => {
      ServerLogger.error(`[mongo.${config.db_name}] MongoDB connection error: ${err.message}`);
    });

    return connection;
  }
}
