import localForage from 'localforage';
import { toJS } from 'mobx';
import ServerConfig from '../config/server.config';
import MessageUtil from './message.util';

class StorageUtil {
  static async resetIndexDB(name: string): Promise<void> {
    const instance = localForage.createInstance({ name, storeName: ServerConfig.server_type, driver: localForage.INDEXEDDB });
    await instance.clear();
  }

  static async saveIndexDB(name: string, key: string, value: any, storage?: LocalForage): Promise<void> {
    try {
      if (!value) {
        return;
      }
      const serializableValue = JSON.parse(JSON.stringify(toJS(value)));
      const instance = storage ?? localForage.createInstance({ name, storeName: ServerConfig.server_type, driver: localForage.INDEXEDDB });
      await instance.setItem(key, serializableValue);
    } catch (error: any) {
      console.error(`Failed to save "${key}" to local storage:`, error);
      MessageUtil.error(error.message);
    }
  }

  static async loadIndexDB<T>(name: string, key: string, defaultValue: T, storage?: LocalForage): Promise<T> {
    const instance = storage ?? localForage.createInstance({ name, storeName: ServerConfig.server_type, driver: localForage.INDEXEDDB });
    const data = await instance.getItem<T>(key);
    if (!data) {
      return defaultValue;
    }
    if (data && defaultValue && !Array.isArray(data) && typeof data === 'object' && typeof defaultValue === 'object') {
      return { ...defaultValue, ...data };
    }

    return data;
  }
}

export default StorageUtil;
