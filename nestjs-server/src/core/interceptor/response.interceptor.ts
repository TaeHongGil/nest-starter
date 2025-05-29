import { CallHandler, ExecutionContext, NestInterceptor, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonResponse } from '../common/response';

export const IS_SKIP_KEY = 'isSkip';

export function SkipResponseInterceptor(): ClassDecorator & MethodDecorator {
  return SetMetadata(IS_SKIP_KEY, true);
}

export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipInterceptor = this.reflector.getAllAndOverride<boolean>(IS_SKIP_KEY, [context.getHandler(), context.getClass()]);
    if (skipInterceptor) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        return CommonResponse.builder().setData(data).build();
      }),
    );
  }
}

export class WsResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipInterceptor = this.reflector.getAllAndOverride<boolean>(IS_SKIP_KEY, [context.getHandler(), context.getClass()]);
    if (skipInterceptor) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        return CommonResponse.builder().setData(data).build();
      }),
    );
  }
}
