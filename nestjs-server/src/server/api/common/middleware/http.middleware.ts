import { Injectable, NestMiddleware } from '@nestjs/common';
import ServerLogger from '@root/core/server-logger/server.logger';
import { NextFunction, Request, Response } from 'express';
import UAParser from 'ua-parser-js';

@Injectable()
export class HttpMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const now = Date.now();
    const originalSend = response.send.bind(response);

    response.send = (body: any): Response => {
      response.locals.body = body;

      return originalSend(body);
    };

    response.on('finish', () => {
      const ua = new (UAParser as any)(request.get('user-agent') || '');
      const method = request.method.toUpperCase();
      const url = request.originalUrl;
      const user = request['session']?.user || {};
      const error = response.locals.error;
      const data: Record<string, any> = {
        ip: request.get('x-forwarded-for') || request.ip,
        method,
        url,
        os: ua.getOS().name?.toLowerCase() || 'unknown',
        role: user.role || 'NONE',
        useridx: user?.useridx ?? 0,
        response_time: Date.now() - now,
      };
      if (error) {
        data.error_message = error.message;
        if (data.error_message == 'invalid or expired token') {
          ServerLogger.warn(`${method} ${url} ${data.error_message}`);
        } else {
          ServerLogger.error(`${method} ${url} ${data.response_time}ms response end`, error.stack, data);
        }
      } else {
        data.query = JSON.stringify(request.query) ?? '{}';
        data.req_body = JSON.stringify(request.body) ?? '{}';
        data.res_body = response.locals.body;
        ServerLogger.http(`${method} ${url} ${data.response_time}ms response end`, data);
      }
    });

    next();
  }
}
