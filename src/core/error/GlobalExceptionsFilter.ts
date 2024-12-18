import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { CommonResponse } from '../common/response';
import { ServerLogger } from '../server-log/server.log.service';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    ServerLogger.error(`${request.method} ${request.path} \nStack: ${exception.stack}`);
    response.status(exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR).json(CommonResponse.builder().setError(new Error(exception.message)).build());
  }
}
