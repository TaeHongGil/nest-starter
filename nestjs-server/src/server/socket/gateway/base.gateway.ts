import { UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { WsAuthService } from '@root/core/auth/ws.auth.service';
import { WsGlobalExceptionFilter } from '@root/core/error/global.exception.filter';
import { WsThrottlerGuard } from '@root/core/guard/throttle.guard';
import { WsResponseInterceptor } from '@root/core/interceptor/response.interceptor';
import { GlobalValidationPipe } from '@root/core/pipe/GlobalValidationPipe';
import { Server } from 'socket.io';

@UsePipes(new GlobalValidationPipe())
@UseFilters(new WsGlobalExceptionFilter())
@UseGuards(WsThrottlerGuard)
@UseInterceptors(WsResponseInterceptor)
export abstract class BaseGateway implements OnGatewayInit {
  constructor(private readonly socketAuthService: WsAuthService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server): void {
    server.use(this.socketAuthService.socketGuard());
  }
}
