import { LoggerService } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import winston, { LoggerOptions, Logger as WinstonLoggerType } from 'winston';
import ServerConfig from '../config/server.config';
import { LOG_COLOR_MAP } from '../define/define';
import StringUtil from '../utils/string.utils';

export class ServerLogger implements LoggerService {
  private static _instance: ServerLogger;
  private logger: WinstonLoggerType;

  constructor(options?: LoggerOptions) {
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
      level: ServerConfig.serverType === 'local' ? 'silly' : 'data',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const color = LOG_COLOR_MAP[level] || 37;
              let metaString = '';
              if (context) metaString += `[${context}]`;
              const metaPad = metaString.padEnd(20, ' ');

              return `[${timestamp}] \x1b[${color}m${level}\t${metaPad}${message}\x1b[0m`;
            }),
          ),
        }),
        new winston.transports.File({
          level: 'error',
          filename: path.join(LOG_DIR_PATH, `${ServerConfig.serverType}-error.log`),
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
          format: winston.format((info, opts) => {
            return info.level === 'error' ? info : false;
          })(),
        }),
        new winston.transports.File({
          level: 'http',
          filename: path.join(LOG_DIR_PATH, `${ServerConfig.serverType}-http.log`),
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
          format: winston.format((info, opts) => {
            return info.level === 'http' ? info : false;
          })(),
        }),
        new winston.transports.File({
          level: 'data',
          filename: path.join(LOG_DIR_PATH, `${ServerConfig.serverType}-data.log`),
          maxsize: 10 * 1024 * 1024,
          maxFiles: 5,
          format: winston.format((info, opts) => {
            return info.level === 'data' ? info : false;
          })(),
        }),
      ],
      ...options,
    });
    ServerLogger._instance = this;
  }

  static get instance(): ServerLogger {
    if (!ServerLogger._instance) {
      ServerLogger._instance = new ServerLogger();
    }

    return ServerLogger._instance;
  }

  static error(message: any, trace?: string, context?: string): void {
    ServerLogger.instance.logger.error(message, { trace, context });
  }

  static warn(message: any, context?: string): void {
    ServerLogger.instance.logger.warn(message, { context });
  }

  static log(message: any, context?: string): void {
    ServerLogger.instance.logger.log('info', message, { context });
  }

  static info(message: any, context?: string): void {
    ServerLogger.instance.logger.info(message, { context });
  }

  static http(message: any, context?: string, data?: any): void {
    ServerLogger.instance.logger.http(message, { context, data });
  }

  static data(message: any, context?: string): void {
    ServerLogger.instance.logger.data(message, { context });
  }

  static verbose(message: any, context?: string): void {
    ServerLogger.instance.logger.verbose(message, { context });
  }

  static debug(message: any, context?: string): void {
    ServerLogger.instance.logger.debug(message, { context });
  }

  static silly(message: any, context?: string): void {
    ServerLogger.instance.logger.silly(message, { context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string): void {
    this.logger.warn(message, { context });
  }

  log(message: any, context?: string): void {
    this.logger.log('info', message, { context });
  }

  info(message: any, context?: string): void {
    this.logger.info(message, { context });
  }

  http(message: any, context?: string): void {
    this.logger.http(message, { context });
  }

  data(message: any, context?: string): void {
    this.logger.data(message, { context });
  }

  verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context });
  }

  debug(message: any, context?: string): void {
    this.logger.debug(message, { context });
  }

  silly(message: any, context?: string): void {
    this.logger.silly(message, { context });
  }
}
