import { type Connection } from 'mongoose';
import { MongoConfig } from '../config/server.config';
import ServerLogger from '../server-logger/server.logger';

/**
 * Mongo Service
 */
export class MongoService {
  onConnectionCreate(db_name: string, config: MongoConfig, connection: Connection): Connection {
    connection.on('connected', () => {
      ServerLogger.log(`[mongo.${db_name}] Connected to MongoDB.`);
    });

    connection.on('disconnected', () => {
      ServerLogger.warn(`[mongo.${db_name}] Disconnected from MongoDB. Waiting for auto-reconnect...`);
    });

    connection.on('error', (err) => {
      ServerLogger.error(`[mongo.${db_name}] MongoDB connection error: ${err.message}`);
    });

    return connection;
  }
}
