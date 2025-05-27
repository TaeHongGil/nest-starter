import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import { Request, Response } from 'express';
import { CommonResponse } from '../common/response';
import ServerLogger from '../server-log/server.logger';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    ServerLogger.error(`${request.method} ${request.path} \nStack: ${exception.stack}`);
    response.json(CommonResponse.builder().setError(exception).build());
  }
}

@Catch(HttpException)
export class WsGlobalExceptionFilter extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ws = host.switchToWs();
    const socket = ws.getClient();
    const data = ws.getData();

    ServerLogger.error(`${data.title} ${data.emitName} \nStack: ${exception.stack}`);
    socket.emit('exception', CommonResponse.builder().setError(exception).build());
  }
}
