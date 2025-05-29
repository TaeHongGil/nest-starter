import CommonUtil from '@root/common/util/common.util';
import MessageUtil from '@root/common/util/message.util';
import StorageUtil from '@root/common/util/storage.util';
import dayjs from 'dayjs';
import JSON5 from 'json5';
import { makeAutoObservable, runInAction } from 'mobx';
import { io, Socket } from 'socket.io-client';
import { protocolStore } from './ProtocolStore';
import SwaggerMetadata, { DefaultSchema, EventInfo } from './SwaggerMetadata';

type SocketLogs = SocketLog[];
type SocketCurrentEvent = Record<string, string>;
type NamespaceSocketMap = Record<string, Socket>;
export type LogType = 'event' | 'system' | 'response';

export interface SocketLog {
  date: string;
  type: LogType;
  namespace: string;
  event: string;
  data: string;
}

export class SocketStore {
  socketMap: NamespaceSocketMap = {};
  eventMap: SocketCurrentEvent = {};
  logList: SocketLogs = [];
  requestBody: string = '';
  eventInfo: EventInfo = { namespace: '', event: '' };
  connectionStatus: Record<string, 'connected' | 'reconnecting' | 'disconnected'> = {};
  refreshTrigger = 0;

  constructor() {
    makeAutoObservable(this);
  }

  async initialize(): Promise<void> {
    const currentEvent = await StorageUtil.loadIndexDB<SocketCurrentEvent>('socket', 'event', {});
    const logs = await StorageUtil.loadIndexDB<SocketLogs>('socket', 'logs', []);
    const path = await StorageUtil.loadIndexDB<EventInfo>('socket', 'path', { namespace: '', event: '' });
    runInAction(() => {
      this.eventMap = currentEvent;
      this.logList = logs;
      this.eventInfo = path;
    });
    const data = this.getCurrentEvent();
    this.setRequestBody(data);
    this.triggerRefresh();
  }

  triggerRefresh(): void {
    runInAction(() => {
      this.refreshTrigger++;
    });
  }

  getNamespaceKey(): string {
    return `${this.eventInfo.namespace}_${this.eventInfo.event}`;
  }

  getRequestSchema(): DefaultSchema {
    return SwaggerMetadata.getEvent(this.eventInfo.namespace, this.eventInfo.event)?.defaultSchema;
  }

  getResponseSchema(): DefaultSchema {
    const eventInfo = SwaggerMetadata.getEvent(this.eventInfo.namespace, this.eventInfo.event);
    if (!eventInfo) return { name: '', schema: undefined };
    const ref = CommonUtil.findAllValuesByKey(eventInfo?.responses, '$ref');
    const name = ref.length > 0 ? SwaggerMetadata.getSchemaName(ref[0]) : '';
    const schema = name ? SwaggerMetadata.getSchema(name) : undefined;

    return { name, schema };
  }

  getCurrentEvent(): string {
    return this.eventMap[this.getNamespaceKey()] ?? SwaggerMetadata.toSchemaString(this.getRequestSchema()?.schema);
  }

  getLogs(): SocketLogs {
    return this.logList;
  }

  async setCurrentEventData(data: string): Promise<void> {
    runInAction(() => {
      this.eventMap[this.getNamespaceKey()] = data;
    });
    await StorageUtil.saveIndexDB('socket', 'event', this.eventMap);
  }

  async setEventInfo(event: EventInfo): Promise<void> {
    runInAction(() => {
      this.eventInfo = event;
    });
    const data = this.getCurrentEvent();
    this.setRequestBody(data);
    await StorageUtil.saveIndexDB('socket', 'path', event);
  }

  setRequestBody(data: string): void {
    runInAction(() => {
      this.requestBody = data;
    });
  }

  async addLog(type: LogType, namespace: string, event: string, log: string): Promise<void> {
    runInAction(() => {
      if (this.logList.length >= 100) {
        this.logList.shift();
      }
      this.logList.push({
        date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        type,
        namespace,
        event,
        data: log,
      });
    });
    await StorageUtil.saveIndexDB('socket', 'logs', this.logList);
  }

  async clearLogs(): Promise<void> {
    runInAction(() => {
      this.logList = [];
    });
    await StorageUtil.saveIndexDB('socket', 'logs', this.logList);
  }

  async resetRequest(): Promise<void> {
    delete this.eventMap[this.getNamespaceKey()];
    const data = this.getCurrentEvent();
    this.setRequestBody(data);
    await StorageUtil.saveIndexDB('socket', 'api', this.eventMap);
  }

  async connectSocket(namespace: string): Promise<void> {
    if (!namespace) return;
    if (this.socketMap[namespace]) {
      this.disconnectSocket(namespace);
    }
    const path = SwaggerMetadata.servers[protocolStore.activeServer].socket ?? '';
    const url = new URL(namespace, path);
    const socket = io(url.toString(), {
      transports: ['websocket'],
      auth: {
        ...protocolStore.globalHeader,
      },
      reconnection: true,
      reconnectionAttempts: 3,
    });
    this.socketMap[namespace] = socket;
    await this.addLog('system', namespace, '', `socket connecting...`);

    socket.on('connect', async () => {
      await this.addLog('system', namespace, 'connect', `socket connected`);
      runInAction(() => {
        this.connectionStatus[namespace] = 'connected';
      });
      const events = SwaggerMetadata.getEvents()[namespace];
      events.forEach((eventName: string) => {
        socket.off(eventName);
        socket.on(eventName, async (data: any) => {
          await this.addLog('event', namespace, eventName, JSON.stringify(data));
        });
      });
    });
    socket.on('disconnect', async (_reason: string) => {
      await this.addLog('system', namespace, 'disconnect', `socket disconnected`);
      runInAction(() => {
        this.connectionStatus[namespace] = 'disconnected';
      });
    });
    socket.on('connect_error', async (err: any) => {
      await this.addLog('system', namespace, 'connect_error', `${err.message}\n${JSON.stringify(err?.data, undefined, 2) ?? ''}`);
      const ioSocket: any = socket.io;
      if (ioSocket && ioSocket._reconnecting === false) {
        runInAction(() => {
          this.connectionStatus[namespace] = 'disconnected';
        });
        this.disconnectSocket(namespace);
      }
    });
    socket.io.on('reconnect_attempt', async (attempt: number) => {
      await this.addLog('system', namespace, 'reconnect_attempt', `socket reconnect ${attempt}회`);
      runInAction(() => {
        this.connectionStatus[namespace] = 'reconnecting';
      });
    });
    socket.io.on('reconnect_failed', () => {
      MessageUtil.error(`[${namespace}] socket reconnect failed`);
      runInAction(() => {
        this.connectionStatus[namespace] = 'disconnected';
      });
    });
    socket.on('exception', async (data: any) => {
      MessageUtil.error(`emit error`);
      await this.addLog('event', namespace, 'exception', JSON.stringify(data, null, 2));
    });
  }

  emitSocketEvent(namespace: string, event: string): void {
    if (!namespace || !event) {
      MessageUtil.error('evnt not found');
      return;
    }

    const socket = this.socketMap[namespace];
    if (!socket || !socket.connected) {
      MessageUtil.error('Socket is not connected');

      return;
    }
    let params;
    try {
      params = JSON5.parse(this.requestBody);
    } catch (error: any) {
      MessageUtil.error(`Invalid JSON format: ${error.message}`);

      return;
    }
    socket.emit(event, params, async (response: any) => {
      await this.addLog('response', namespace, event, `${JSON.stringify(response, null, 2)}`);
    });
    MessageUtil.info(`emit ${event}`);
  }

  disconnectSocket(namespace: string): void {
    const socket = this.socketMap[namespace];
    if (socket) {
      const events = SwaggerMetadata.getEvents()[namespace];
      events.forEach((eventName: string) => {
        socket.off(eventName);
      });
      socket.close();
      delete this.socketMap[namespace];
    }
  }

  disconnectAllSockets(): void {
    Object.keys(this.socketMap).forEach((namespace) => {
      this.disconnectSocket(namespace);
    });
    this.socketMap = {};
  }
}
