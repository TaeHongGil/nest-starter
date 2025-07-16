import { SetMetadata } from '@nestjs/common';
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
