import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { WsGlobalExceptionFilter } from '@root/core/error/global.exception.filter';
import { WsThrottlerGuard } from '@root/core/guard/throttle.guard';
import { WsResponseInterceptor } from '@root/core/interceptor/response.interceptor';
import { WsAuthMiddleware } from '@root/core/middleware/ws.auth.middleware';
import { GlobalValidationPipe } from '@root/core/pipe/GlobalValidationPipe';
import { Server } from 'socket.io';

@UsePipes(new GlobalValidationPipe())
@UseFilters(new WsGlobalExceptionFilter())
@UseGuards(WsThrottlerGuard)
@UseInterceptors(WsResponseInterceptor)
export abstract class BaseGateway implements OnGatewayInit {
  constructor() {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server): void {
    server.use(new WsAuthMiddleware().use());
  }
}
