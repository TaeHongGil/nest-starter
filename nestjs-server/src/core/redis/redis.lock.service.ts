import { Injectable } from '@nestjs/common';
import RedisLock from './redis.lock';
import { RedisService } from './redis.service';

export type LockType = 'user' | 'guild';

@Injectable()
export class RedisLockService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 특정 유저에 대해 잠금을 설정하고, 주어진 함수를 실행합니다.
   */
  async withUserLock<T>(useridx: number, fn: () => Promise<T>, options = {}): Promise<T> {
    const client = this.redisService.getGlobalClient();
    const key = `lock:user:${useridx}`;
    const lock = new RedisLock(client, key, options);
    const acquired = await lock.acquireWithRetry();
    if (!acquired) throw new Error('lock already acquired - useridx: ' + useridx);
    try {
      return await fn();
    } finally {
      await lock.release();
    }
  }

  /**
   * 여러 유저의 상호작용을 동시에 처리할 수 있도록 잠금을 설정하고, 주어진 함수를 실행합니다.
   * @param useridxs - 유저 인덱스 배열
   */
  async withInteractionLock<T>(useridxs: number[], fn: () => Promise<T>, options = {}): Promise<T> {
    const client = this.redisService.getGlobalClient();
    const ids = [...useridxs].sort();
    const locks = ids.map((id) => new RedisLock(client, `lock:user:${id}`, options));
    let acquiredCount = 0;
    for (const lock of locks) {
      const acquired = await lock.acquireWithRetry();
      if (!acquired) break;
      acquiredCount++;
    }
    if (acquiredCount !== locks.length) {
      for (let i = 0; i < acquiredCount; i++) {
        await locks[i].release();
      }
      throw new Error('lock already acquired - useridxs: ' + useridxs.join(', '));
    }
    try {
      return await fn();
    } finally {
      for (const lock of locks) {
        await lock.release();
      }
    }
  }

  /**
   * 특정 key와 ID에 대해 잠금을 설정하고, 주어진 함수를 실행합니다.
   */
  async withKeyLock<T>(type: string, id: number, fn: () => Promise<T>, options = {}): Promise<T> {
    const client = this.redisService.getGlobalClient();
    const key = `lock:${type}:${id}`;
    const lock = new RedisLock(client, key, options);
    const acquired = await lock.acquireWithRetry();
    if (!acquired) throw new Error('lock already acquired - key: ' + key + ', id: ' + id);
    try {
      return await fn();
    } finally {
      await lock.release();
    }
  }
}
