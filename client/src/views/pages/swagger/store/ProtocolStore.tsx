import StorageUtil from '@root/common/util/storage.util';
import { makeAutoObservable, runInAction } from 'mobx';
import { HttpStore } from './HttpStore';
import { SocketStore } from './SocketStore';
import SwaggerMetadata from './SwaggerMetadata';

// 타입 정의
export type ProtocolServerType = 'api' | 'socket';

export type GlobalHeader = Record<string, string>;

export class ProtocolStore {
  server_type: ProtocolServerType = 'api';
  httpStore: HttpStore = new HttpStore();
  socketStore: SocketStore = new SocketStore();
  activeServer: string = 'local';
  globalHeader: GlobalHeader = {};

  constructor() {
    makeAutoObservable(this);
  }

  async initialize(): Promise<void> {
    if (!SwaggerMetadata.init) return;
    const globalHeader = await StorageUtil.loadIndexDB<GlobalHeader>('protocol', 'global_header', SwaggerMetadata.config.header ?? {});
    const activeServer = await StorageUtil.loadIndexDB<string>('protocol', 'active_server', Object.keys(SwaggerMetadata.servers ?? {}).find((key) => SwaggerMetadata.servers[key]) ?? 'local');
    const serverType = await StorageUtil.loadIndexDB<ProtocolServerType>('protocol', 'server_type', 'api');
    runInAction(() => {
      this.globalHeader = globalHeader;
      this.activeServer = activeServer;
      this.server_type = serverType;
    });
    await this.httpStore.initialize();
    await this.socketStore.initialize();
  }

  async resetAll(): Promise<void> {
    await StorageUtil.resetIndexDB('protocol');
    await StorageUtil.resetIndexDB('http');
    await StorageUtil.resetIndexDB('socket');
    await this.initialize();
  }

  async toggleServerType(): Promise<void> {
    runInAction(() => {
      this.server_type = this.server_type === 'api' ? 'socket' : 'api';
    });
    await StorageUtil.saveIndexDB('protocol', 'server_type', this.server_type);
  }

  async setAuthHeader(path: string, data: any): Promise<void> {
    if (!SwaggerMetadata.config?.token) return;
    const tokenPath = SwaggerMetadata.config.token[path];
    if (tokenPath) {
      const token = tokenPath.split('.').reduce((obj, key) => obj?.[key], data);
      if (token) {
        runInAction(() => {
          this.globalHeader.Authorization = `Bearer ${token}`;
        });
      }
    }
  }

  async setGlobalHeader(header?: GlobalHeader): Promise<void> {
    if (header) {
      runInAction(() => {
        this.globalHeader = header;
      });
    }
    await StorageUtil.saveIndexDB('protocol', 'global_header', this.globalHeader);
  }

  async setActiveServer(server: string): Promise<void> {
    runInAction(() => {
      this.activeServer = server;
    });
    await StorageUtil.saveIndexDB('protocol', 'active_server', this.activeServer);
  }
}

let protocolStore: ProtocolStore;
if (typeof window !== 'undefined' && (window as any).__protocolStore__) {
  protocolStore = (window as any).__protocolStore__;
} else {
  protocolStore = new ProtocolStore();
  if (typeof window !== 'undefined') {
    (window as any).__protocolStore__ = protocolStore;
  }
}
export { protocolStore };
