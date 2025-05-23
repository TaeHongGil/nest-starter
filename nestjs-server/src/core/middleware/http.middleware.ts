import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ServerLogger } from '../server-log/server.log.service';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url } = request;
    const agent = request.get('user-agent') || '';
    const now = Date.now();

    const originalSend = response.send.bind(response);
    response.send = (body: any): Response => {
      response.locals.body = body;

      return originalSend(body);
    };

    response.on('finish', () => {
      const responseBody = JSON.parse(response.locals.body);
      const error = responseBody.error || undefined;
      const data = {
        ip,
        method,
        url,
        agent,
        responseTime: Date.now() - now,
        responseBody: responseBody,
      };
      ServerLogger.http(`${method} ${url} ${data.responseTime}ms response ${error ? 'error' : 'success'}`, 'HTTP', data);
    });

    next();
  }
}
