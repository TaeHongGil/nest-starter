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
    const request = context.switchToHttp().getRequest();
    const now = Date.now();

    const skipInterceptor = this.reflector.get<boolean>('skipInterceptor', context.getHandler()) || this.reflector.get<boolean>('skipInterceptor', context.getClass());

    if (skipInterceptor) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        console.log(`${request.method} ${request.path} 처리 속도: ${Date.now() - now}ms`);

        return CommonResponse.builder().setData(data).build();
      }),
    );
  }
}
