import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import ServerLogger from '../server-log/server.logger';

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
      const data = {
        ip,
        method,
        url,
        agent,
        responseTime: Date.now() - now,
        responseBody: response.locals.body,
      };
      ServerLogger.http(`${method} ${url} ${data.responseTime}ms response end`, data);
    });

    next();
  }
}
