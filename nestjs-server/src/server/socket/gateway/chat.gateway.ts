import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthService } from '../../../core/auth/socket.auth.service';
import { SocketEvent } from '../define/socket.define';
import { ReqSendMessage } from '../dto/socket.request.dto';
import { ResSendMessage } from '../dto/socket.response.dto';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayInit {
  constructor(private readonly socketAuthService: SocketAuthService) {}

  afterInit(server: Server): void {
    server.use(this.socketAuthService.socketGuard());
  }

  /**
   * 메세지 전송
   */
  @SubscribeMessage(SocketEvent.Chat)
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() req: ReqSendMessage): ResSendMessage {
    client.broadcast.emit(SocketEvent.Chat, req.message);

    return { result: true };
  }
}
