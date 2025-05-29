import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Response } from 'express';
import { CommonResponse } from '../common/response';
import ServerLogger from '../server-logger/server.logger';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.locals.error = exception;
    response.json(CommonResponse.builder().setError(exception).build());
  }
}

@Catch(HttpException)
export class WsGlobalExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ws = host.switchToWs();
    const socket = ws.getClient();
    const data = ws.getData();

    ServerLogger.error(`${data.title} ${data.emitName}`, exception.stack);
    socket.emit('exception', CommonResponse.builder().setError(exception).build());
  }
}
