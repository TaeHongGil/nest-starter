import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { SocketEvent } from '../define/ws.define';
import { ReqSendMessage } from '../dto/ws.request.dto';
import { ResSendMessage } from '../dto/ws.response.dto';
import { BaseGateway } from './base.gateway';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway extends BaseGateway {
  /**
   * 메세지 전송
   */
  @SubscribeMessage(SocketEvent.SendMessage)
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() req: ReqSendMessage): ResSendMessage {
    this.server.emit(SocketEvent.SendMessage, req.message);

    return { result: true };
  }
}
