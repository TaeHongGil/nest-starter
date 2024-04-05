import request from 'supertest';
import { App } from 'supertest/types';

export async function postAsync(server: App, url: string, param = {}): Promise<any> {
  const res = await request(server).post(url).send(param);
  return res;
}

export async function getAsync(server: App, url: string, param = {}): Promise<any> {
  const res = await request(server).get(url).send(param);
  return res;
}
