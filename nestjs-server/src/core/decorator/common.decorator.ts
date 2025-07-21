import { SetMetadata } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { ROLE } from '@root/core/define/define';

export const IS_PUBLIC_KEY = 'isPublic';

export function NoAuthGuard(): ClassDecorator & MethodDecorator {
  return SetMetadata(IS_PUBLIC_KEY, true);
}

export const IS_SKIP_KEY = 'isSkip';

export function SkipResponseInterceptor(): ClassDecorator & MethodDecorator {
  return SetMetadata(IS_SKIP_KEY, true);
}

export const IS_ROLE_KEY = 'isRole';

export function RoleGuard(role: ROLE): ClassDecorator & MethodDecorator {
  return SetMetadata(IS_ROLE_KEY, role);
}

export const CRON_KEY = 'CRON_KEY';

export interface CustomCronMetadata {
  name: string;
  method: string | symbol;
  cronTime: string;
}

/**
 * DDS Cron
 *
 * @param name - 크론 작업의 고유 이름
 * @param cronTime - 크론 표현식(기본값: 10분에 한번)
 */
export function CustomCron(name: string, cronTime: string = CronExpression.EVERY_10_MINUTES): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const existing: CustomCronMetadata[] = Reflect.getMetadata(CRON_KEY, target.constructor) || [];
    existing.push({ name, method: propertyKey, cronTime });
    Reflect.defineMetadata(CRON_KEY, existing, target.constructor);
  };
}
