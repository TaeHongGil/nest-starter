import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { WsGlobalExceptionFilter } from '@root/core/error/global.exception.filter';
import { GlobalValidationPipe } from '@root/core/pipe/GlobalValidationPipe';
import { WsThrottlerGuard } from '@root/server/ws/common/guard/ws.throttle.guard';
import { WsResponseInterceptor } from '@root/server/ws/common/interceptor/ws.response.interceptor';
import { WsAuthMiddleware } from '@root/server/ws/common/middleware/ws.auth.middleware';
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
