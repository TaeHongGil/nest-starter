import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { SwaggerController } from '@root/feature/swagger/swagger.controller';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonResponse } from '../common/response';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();
    if (context.getClass() == SwaggerController) {
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
