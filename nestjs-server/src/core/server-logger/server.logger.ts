import { LoggerService } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import winston, { Logger as WinstonLoggerType } from 'winston';
import winstonDaily from 'winston-daily-rotate-file';
import ServerConfig from '../config/server.config';
import { LOG_COLOR_MAP } from '../define/core.define';
import StringUtil from '../utils/string.utils';

class ServerLogger implements LoggerService {
  static logger: WinstonLoggerType;

  static {
    const LOG_DIR_PATH = path.join(__dirname, '..', '..', '..', 'docker-elk', 'logs', StringUtil.toSnakeCase(ServerConfig.service.name));
    if (!existsSync(LOG_DIR_PATH)) {
      mkdirSync(LOG_DIR_PATH, { recursive: true });
    }

    this.logger = winston.createLogger({
      levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        data: 5,
        verbose: 6,
        debug: 7,
        silly: 8,
      },
      level: ServerConfig.zone === 'local' ? 'silly' : 'data',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const color = LOG_COLOR_MAP[level] || 37;
              const metaString = context ? `[${context}]` : '';
              const metaPad = metaString.padEnd(20, ' ');

              const formatData = (data: any): string => {
                let dataStr = JSON.stringify(data, null, 2);
                if (dataStr.length > 1000) {
                  dataStr = dataStr.slice(0, 1000) + '......';
                }

                return dataStr;
              };

              if (level === 'error' || level === 'http' || level === 'data') {
                if (meta.trace) {
                  message = `${message}\n\n${meta.trace}`;
                }
                if (meta.data) {
                  message = `${message}\n\n${formatData(meta.data)}`;
                }
              }

              return `[${timestamp}] \x1b[${color}m${level.toUpperCase()}\t${metaPad}${message}\x1b[0m`;
            }),
          ),
        }),
        ...['error', 'http', 'data'].map(
          (logLevel) =>
            new winstonDaily({
              level: logLevel,
              datePattern: 'YYYY-MM-DD',
              filename: path.join(LOG_DIR_PATH, `${ServerConfig.zone}-${logLevel}-%DATE%.log`),
              maxFiles: '3d',
              format: winston.format((info) => {
                if (info.level !== logLevel) {
                  return false;
                }
                if (logLevel === 'error' && !info.trace && !info.data) {
                  return false;
                }

                return info;
              })(),
            }),
        ),
      ],
    });
  }

  static error(message: any, trace?: string, data?: any): void {
    this.logger.error(message, { timestamp: new Date(), trace, data });
  }

  static warn(message: any, context?: string): void {
    this.logger.warn(message, { context });
  }

  static log(message: any, context?: string): void {
    this.logger.log('info', message, { context });
  }

  static info(message: any, context?: string): void {
    this.logger.info(message, { context });
  }

  static http(message: any, data: any): void {
    this.logger.http(message, { timestamp: new Date(), data });
  }

  static data(message: any, data: any): void {
    this.logger.data(message, { timestamp: new Date(), data });
  }

  static verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context });
  }

  static debug(message: any, context?: string): void {
    this.logger.debug(message, { context });
  }

  static silly(message: any, context?: string): void {
    this.logger.silly(message, { context });
  }

  error(message: any, trace?: string, data?: any): void {
    const msg = message;
    if (message instanceof Error) {
      message = msg.message;
      trace = msg.stack;
    }
    if (!trace && !data) return;
    ServerLogger.logger.error(message, { timestamp: new Date(), trace, data });
  }

  warn(message: any, context?: string): void {
    ServerLogger.logger.warn(message, { context });
  }

  log(message: any, context?: string): void {
    ServerLogger.logger.log('info', message, { context });
  }

  info(message: any, context?: string): void {
    ServerLogger.logger.info(message, { context });
  }

  http(message: any, data?: any): void {
    ServerLogger.logger.http(message, { timestamp: new Date(), data });
  }

  data(message: any, data: any): void {
    ServerLogger.logger.data(message, { timestamp: new Date(), data });
  }

  verbose(message: any, context?: string): void {
    ServerLogger.logger.verbose(message, { context });
  }

  debug(message: any, context?: string): void {
    ServerLogger.logger.debug(message, { context });
  }

  silly(message: any, context?: string): void {
    ServerLogger.logger.silly(message, { context });
  }
}

export default ServerLogger;
