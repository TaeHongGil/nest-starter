import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ServerLogger } from '../server-log/server.log.service';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
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
        originalUrl,
        agent: userAgent,
        statusCode: response.statusCode,
        responseTime: Date.now() - now,
        responseBody: response.locals.body,
      };
      ServerLogger.http('response end', 'HTTP', data);
    });

    next();
  }
}
