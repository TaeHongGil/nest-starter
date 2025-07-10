import { RedisClientType } from 'redis';
import ServerLogger from '../server-logger/server.logger';

interface RedisLockOptions {
  retryCount?: number;
  retryDelay?: number;
  ttl?: number;
}

class RedisLock {
  private client: RedisClientType;
  private key: string;
  private options: Required<RedisLockOptions>;

  constructor(client: RedisClientType, key: string, options: RedisLockOptions = {}) {
    this.client = client;
    this.key = key;
    this.options = {
      retryCount: options.retryCount ?? 10,
      retryDelay: options.retryDelay ?? 100,
      ttl: options.ttl ?? 10000,
    };
  }

  private async acquire(): Promise<boolean> {
    const result = await this.client.set(this.key, 'locked', {
      NX: true,
      PX: this.options.ttl,
    });

    return !result || result === 'OK';
  }

  async release(): Promise<void> {
    try {
      const result = await this.client.del(this.key);
      if (result === 0) {
        ServerLogger.debug(`lock: ${this.key} already released`);
      }
    } catch (e) {
      ServerLogger.debug(e);
    }
  }

  async acquireWithRetry(): Promise<boolean> {
    for (let i = 0; i < this.options.retryCount; i++) {
      const locked = await this.acquire();
      if (locked) return true;
      await new Promise((resolve) => setTimeout(resolve, this.options.retryDelay));
    }

    return false;
  }
}

export default RedisLock;
