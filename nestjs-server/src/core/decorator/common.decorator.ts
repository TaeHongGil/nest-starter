import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export function NoAuthGuard(): ClassDecorator & MethodDecorator {
  return SetMetadata(IS_PUBLIC_KEY, true);
}

export const IS_SKIP_KEY = 'isSkip';

export function SkipResponseInterceptor(): ClassDecorator & MethodDecorator {
  return SetMetadata(IS_SKIP_KEY, true);
}
