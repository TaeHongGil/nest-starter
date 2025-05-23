import { CallHandler, CustomDecorator, ExecutionContext, Injectable, NestInterceptor, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonResponse } from '../common/response';

export const SkipResponseInterceptor = (): CustomDecorator => SetMetadata('skipInterceptor', true);

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipInterceptor = this.reflector.get<boolean>('skipInterceptor', context.getHandler()) || this.reflector.get<boolean>('skipInterceptor', context.getClass());
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

@Injectable()
export class WsResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipInterceptor = this.reflector.get<boolean>('skipInterceptor', context.getHandler()) || this.reflector.get<boolean>('skipInterceptor', context.getClass());
    if (skipInterceptor) {
      return next.handle();
    }

    return next.handle().pipe(
      map((result) => {
        return CommonResponse.builder().setData(result).build();
      }),
    );
  }
}
