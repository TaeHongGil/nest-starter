import { CronExpression } from '@nestjs/schedule';

export const CUSTOM_CRON_KEY = 'CUSTOM_CRON_KEY';

export interface ICustomCronMetadata {
  name: string;
  method: string | symbol;
  cronTime: string;
}

/**
 * CustomCron 데코레이터
 *
 * @param name - 크론 작업의 고유 이름
 * @param cronTime - 크론 표현식(기본값: 10분에 한번)
 */
export function CustomCron(name: string, cronTime: string = CronExpression.EVERY_10_MINUTES): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const existing: ICustomCronMetadata[] = Reflect.getMetadata(CUSTOM_CRON_KEY, target.constructor) || [];
    existing.push({ name, method: propertyKey, cronTime });
    Reflect.defineMetadata(CUSTOM_CRON_KEY, existing, target.constructor);
  };
}
