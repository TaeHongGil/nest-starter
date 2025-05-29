import { Injectable } from '@nestjs/common';
import { CoreRedisKeys } from '../define/core.redis.key';
import { RedisService } from '../redis/redis.service';
import ServerLogger from '../server-log/server.logger';

/**
 * Cache Service
 */
@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 캐시에 데이터를 저장한다.
   * @param key 캐시 키
   * @param value 저장할 값
   * @param ttl (선택) TTL 값을 초 단위로 설정 (기본값: 600초 = 10분)
   */
  async set(key: string, value: any, ttl: number = 600): Promise<void> {
    try {
      const redis = this.redisService.getGlobalClient();
      if (redis) {
        await redis.set(CoreRedisKeys.getGlobalCacheKey(key), typeof value == 'object' ? JSON.stringify(value) : value, { EX: ttl });
      }
    } catch (error) {
      ServerLogger.error(`Failed to set cache to Redis for key: ${key}`, error.stack);
    }
  }

  /**
   * 캐시에서 데이터를 가져온다.
   * @param key 캐시 키 또는 키 패턴
   * @param isPattern 패턴 검색 여부
   * @returns 캐시 값 또는 패턴에 일치하는 값들의 배열 (없을 경우 undefined 반환)
   */
  async get<T>(key: string, isPattern: boolean = false): Promise<T | T[] | undefined> {
    try {
      const redis = this.redisService.getGlobalClient();
      if (redis) {
        if (isPattern) {
          const keys = await redis.keys(CoreRedisKeys.getGlobalCacheKey(key));
          const result: T[] = [];
          for (const k of keys) {
            const redisData = await redis.get(k);
            if (typeof redisData === 'string') {
              try {
                result.push(JSON.parse(redisData));
              } catch {
                result.push(redisData as any);
              }
            } else if (redisData) {
              result.push(redisData as any);
            }
          }

          return result.length > 0 ? result : undefined;
        } else {
          const redisData = await redis.get(CoreRedisKeys.getGlobalCacheKey(key));
          if (typeof redisData === 'string') {
            try {
              return JSON.parse(redisData) as T;
            } catch {
              return redisData as any;
            }
          } else if (redisData) {
            return redisData as any;
          }
        }
      }
    } catch (error) {
      ServerLogger.error(`Failed to get cache from Redis for key: ${key}`, error.stack);
    }

    return undefined;
  }

  /**
   * 캐시에서 데이터를 삭제한다.
   * @param key 캐시 키
   */
  async delete(key: string): Promise<void> {
    try {
      const redis = this.redisService.getGlobalClient();
      if (redis) {
        await redis.del(CoreRedisKeys.getGlobalCacheKey(key));
      }
    } catch (error) {
      ServerLogger.error(`Failed to delete cache from Redis for key: ${key}`, error.stack);
    }
  }

  /**
   * 캐시에 데이터가 있는지 확인한다.
   * @param key 캐시 키
   * @returns 데이터 존재 여부
   */
  async has(key: string): Promise<boolean> {
    try {
      const redis = this.redisService.getGlobalClient();
      if (redis) {
        const exists = await redis.exists(CoreRedisKeys.getGlobalCacheKey(key));

        return exists === 1;
      }
    } catch (error) {
      ServerLogger.error(`Failed to check existence of key in Redis: ${key}`, error.stack);
    }

    return false;
  }

  /**
   * 캐시를 비운다.
   */
  async clear(): Promise<void> {
    try {
      const redis = this.redisService.getGlobalClient();
      if (redis) {
        const keys = await redis.keys(`${CoreRedisKeys.getGlobalCacheKey('*')}`);
        if (keys.length > 0) {
          await redis.del([...keys]);
        }
      }
    } catch (error) {
      ServerLogger.error('Failed to clear cache from Redis.', error.stack);
    }
  }
}
