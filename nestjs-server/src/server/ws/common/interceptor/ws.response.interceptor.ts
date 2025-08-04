import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CommonResponse } from '@root/core/common/response';
import { IS_SKIP_KEY } from '@root/core/decorator/core.decorator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
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
