import { Server } from 'socket.io';

export type WsMiddleware = Parameters<Server['use']>[0];

export enum SocketEvent {
  /**
   * 메세지 전송
   */
  SendMessage = 'sendMessage',
}
