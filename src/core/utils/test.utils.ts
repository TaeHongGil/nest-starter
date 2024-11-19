import request from 'supertest';
import { App } from 'supertest/types';

class TestUtil {
  static async postAsync(server: App, url: string, param = {}): Promise<any> {
    const res = await request(server).post(url).send(param);

    return res;
  }

  static async getAsync(server: App, url: string, param = {}): Promise<any> {
    const res = await request(server).get(url).send(param);

    return res;
  }
}

export default TestUtil;
